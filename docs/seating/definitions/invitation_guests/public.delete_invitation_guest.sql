-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
CREATE OR REPLACE FUNCTION public.delete_invitation_guest(p_guest_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare
  v_user_id uuid;

  v_project_id uuid;
  v_invitation_id uuid;
  v_recipient_id uuid;

  v_guest public.invitation_guests;

  v_new_primary_guest_id uuid;
  v_deleted_guest_id uuid;

begin
  -- =========================================
  -- Authentication
  -- =========================================

  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception
      'Prijava je obavezna.'
      using errcode = '42501';
  end if;


  -- =========================================
  -- Resolve Guest
  -- =========================================

  select
    guest.project_id,
    guest.invitation_id,
    guest.recipient_id
  into
    v_project_id,
    v_invitation_id,
    v_recipient_id
  from public.invitation_guests guest
  where guest.id = p_guest_id;

  if not found then
    raise exception
      'Gost nije pronađen.'
      using errcode = 'P0002';
  end if;


  -- =========================================
  -- Authorization
  -- =========================================

  if private.is_project_member(
    v_project_id,
    v_user_id
  ) is not true then
    raise exception
      'Projekt nije pronađen ili nemate pristup.'
      using errcode = '42501';
  end if;


  perform private.lock_seating_project(v_project_id);

  -- =========================================
  -- Lock Recipient
  -- Serialize deletes for the same recipient.
  -- =========================================

  if v_recipient_id is not null then

    perform 1
    from public.invitation_recipients recipient
    where recipient.project_id = v_project_id
      and recipient.invitation_id = v_invitation_id
      and recipient.id = v_recipient_id
    for update;

  end if;


  -- =========================================
  -- Lock and Re-read Guest
  -- =========================================

  select guest.*
  into v_guest
  from public.invitation_guests guest
  where guest.id = p_guest_id
  for update;

  if not found then
    raise exception
      'Gost nije pronađen.'
      using errcode = 'P0002';
  end if;

  if v_guest.project_id is distinct from v_project_id
    or v_guest.invitation_id is distinct from v_invitation_id
    or v_guest.recipient_id is distinct from v_recipient_id
  then
    raise exception
      'Gost je u međuvremenu promijenjen. Pokušajte ponovno.'
      using errcode = '40001';
  end if;


  -- =========================================
  -- Delete Guest First
  -- Frees the unique primary-guest slot.
  -- RSVP guest rows are deleted by FK cascade.
  -- =========================================

  delete from public.invitation_generic_guest_links where invitation_id=v_invitation_id and project_guest_id=v_guest.project_guest_id;

  delete from public.invitation_guests
  where id = p_guest_id
  returning id into v_deleted_guest_id;


  -- =========================================
  -- Maintain Recipient
  -- =========================================

  if v_recipient_id is not null then

    select guest.id
    into v_new_primary_guest_id
    from public.invitation_guests guest
    where guest.project_id = v_project_id
      and guest.invitation_id = v_invitation_id
      and guest.recipient_id = v_recipient_id
    order by
      guest.created_at,
      guest.id
    limit 1
    for update;


    -- =======================================
    -- No Guests Remain: Delete Recipient
    -- =======================================

    if v_new_primary_guest_id is null then

      delete from public.invitation_recipients
      where project_id = v_project_id
        and invitation_id = v_invitation_id
        and id = v_recipient_id;


    -- =======================================
    -- Primary Guest Deleted: Assign Replacement
    -- =======================================

    elsif v_guest.is_primary then

      update public.invitation_guests
      set is_primary = true
      where project_id = v_project_id
        and invitation_id = v_invitation_id
        and recipient_id = v_recipient_id
        and id = v_new_primary_guest_id;

    end if;

  end if;

  return v_deleted_guest_id;

end;

$function$;
