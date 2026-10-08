-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
CREATE OR REPLACE FUNCTION public.get_public_rsvp(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare
  v_token text;
  v_token_hash text;

  v_project_id uuid;
  v_invitation_id uuid;
  v_recipient_id uuid;

  v_invitation_public_id text;
  v_invitation_name text;
  v_invitation_document jsonb;
  v_invitation_document_version integer;

  v_response_id uuid;
  v_submitted_at timestamptz;

  v_photos jsonb;
  v_guests jsonb;

begin
  -- =========================================
  -- Validate Token
  -- Generated tokens contain 64 hex characters.
  -- =========================================

  v_token := nullif(trim(p_token), '');

  if v_token is null
    or v_token !~ '^[0-9a-f]{64}$'
  then
    raise exception
      'RSVP poveznica nije valjana.'
      using errcode = '22023';
  end if;


  -- =========================================
  -- Hash Token
  -- Public lookup uses the SHA-256 hash.
  -- =========================================

  v_token_hash := encode(
    extensions.digest(v_token, 'sha256'),
    'hex'
  );


  -- =========================================
  -- Resolve Recipient and Published Invitation
  -- All internal IDs are derived from the token.
  -- =========================================

  select
    recipient.project_id,
    recipient.invitation_id,
    recipient.id,
    invitation.public_id,
    invitation.name,
    invitation.document,
    invitation.document_version
  into
    v_project_id,
    v_invitation_id,
    v_recipient_id,
    v_invitation_public_id,
    v_invitation_name,
    v_invitation_document,
    v_invitation_document_version
  from public.invitation_recipients recipient
  join public.invitations invitation
    on invitation.project_id = recipient.project_id
    and invitation.id = recipient.invitation_id
  where recipient.token_hash = v_token_hash
    and invitation.is_public = true
    and invitation.published_at is not null;

  if not found then
    raise exception
      'RSVP poveznica nije valjana ili pozivnica nije dostupna.'
      using errcode = 'P0002';
  end if;


  -- =========================================
  -- Invitation Photos
  -- Only photo assets from the same project.
  -- =========================================

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', photo.id,
        'image_path', photo.image_path,
        'description', invitation_photo.description
      )
      order by
        invitation_photo.created_at,
        invitation_photo.photo_id
    ),
    '[]'::jsonb
  )
  into v_photos
  from public.invitation_photos invitation_photo
  join public.project_photos photo
    on photo.id = invitation_photo.photo_id
    and photo.project_id = v_project_id
  where invitation_photo.invitation_id = v_invitation_id;


  -- =========================================
  -- Existing Personalized RSVP Response
  -- =========================================

  select
    response.id,
    response.submitted_at
  into
    v_response_id,
    v_submitted_at
  from public.rsvp_responses response
  where response.project_id = v_project_id
    and response.invitation_id = v_invitation_id
    and response.recipient_id = v_recipient_id
    and response.response_type = 'personalized';


  -- =========================================
  -- Recipient Guests and Existing Answers
  -- Names now come from invitation_guests.
  -- =========================================

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'invitation_guest_id', guest.id,
        'first_name', guest.first_name,
        'last_name', guest.last_name,
        'is_primary', guest.is_primary,
        'status', response_guest.status,
        'answers', response_guest.answers
      )
      order by
        guest.is_primary desc,
        guest.created_at,
        guest.id
    ),
    '[]'::jsonb
  )
  into v_guests
  from public.invitation_guests guest
  left join public.rsvp_response_guests response_guest
    on response_guest.project_id = guest.project_id
    and response_guest.invitation_id = guest.invitation_id
    and response_guest.invitation_guest_id = guest.id
    and response_guest.response_id = v_response_id
  where guest.project_id = v_project_id
    and guest.invitation_id = v_invitation_id
    and guest.recipient_id = v_recipient_id;


  -- =========================================
  -- Integrity
  -- =========================================

  if jsonb_array_length(v_guests) < 1 then
    raise exception
      'RSVP primatelj nema povezanih gostiju.'
      using errcode = 'P0002';
  end if;


  -- =========================================
  -- Return Public RSVP Context
  -- =========================================

  return jsonb_build_object(
    'invitation',
      jsonb_build_object(
        'public_id', v_invitation_public_id,
        'name', v_invitation_name,
        'document', v_invitation_document,
        'document_version', v_invitation_document_version
      ),
    'photos', v_photos,
    'recipient',
      jsonb_build_object(
        'has_response', v_response_id is not null,
        'submitted_at', v_submitted_at
      ),
    'guests', v_guests
  );

end;

$function$;
