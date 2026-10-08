-- SAVE/REVIEW ONLY: final proposed definition, not a read-only query.
-- Do not execute definitions on the installed database. Use numbered install scripts.
CREATE OR REPLACE FUNCTION public.create_invitation_guest(p_invitation_id uuid, p_group_id uuid, p_first_name text, p_last_name text, p_notes text)
 RETURNS invitation_guests
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare
  v_user_id uuid;
  v_project_id uuid;

  v_first_name text;
  v_last_name text;
  v_notes text;

  v_guest public.invitation_guests;

begin
  -- =========================================
  -- Authentication
  -- =========================================

  v_user_id :=
    auth.uid();

  if v_user_id is null then
    raise exception
      'Prijava je obavezna.'
      using errcode = '42501';
  end if;


  -- =========================================
  -- Invitation
  -- Derive Project from Invitation
  -- =========================================

  select
    invitation.project_id
  into
    v_project_id
  from public.invitations invitation
  where invitation.id =
    p_invitation_id;

  if not found then
    raise exception
      'Pozivnica nije pronađena.'
      using errcode = 'P0002';
  end if;


  -- =========================================
  -- Authorization
  -- Project members can create guests
  -- =========================================

  if not private.is_project_member(
    v_project_id,
    v_user_id
  ) then
    raise exception
      'Projekt nije pronađen ili nemate pristup.'
      using errcode = '42501';
  end if;


  -- =========================================
  -- Validate First Name
  -- =========================================

  v_first_name :=
    nullif(
      trim(p_first_name),
      ''
    );

  if v_first_name is null
    or char_length(v_first_name) > 100
  then
    raise exception
      'Ime gosta mora imati između 1 i 100 znakova.'
      using errcode = '22023';
  end if;


  -- =========================================
  -- Normalize Optional Fields
  -- =========================================

  v_last_name :=
    nullif(
      trim(p_last_name),
      ''
    );

  v_notes :=
    nullif(
      trim(p_notes),
      ''
    );


  -- =========================================
  -- Validate Last Name
  -- =========================================

  if v_last_name is not null
    and char_length(v_last_name) > 100
  then
    raise exception
      'Prezime gosta može imati najviše 100 znakova.'
      using errcode = '22023';
  end if;


  -- =========================================
  -- Validate Notes
  -- =========================================

  if v_notes is not null
    and char_length(v_notes) > 2000
  then
    raise exception
      'Bilješka može imati najviše 2000 znakova.'
      using errcode = '22023';
  end if;


  -- =========================================
  -- Validate Guest Group
  -- Must belong to same Invitation
  -- =========================================

  if p_group_id is not null
    and not exists (
      select
        1
      from public.invitation_guest_groups guest_group
      where guest_group.project_id =
        v_project_id
        and guest_group.invitation_id =
          p_invitation_id
        and guest_group.id =
          p_group_id
    )
  then
    raise exception
      'Grupa gostiju nije pronađena u ovoj pozivnici.'
      using errcode = '22023';
  end if;


  -- =========================================
  -- Create Guest
  --
  -- Recipient is assigned separately when
  -- personalized recipient is created.
  -- =========================================

  perform private.lock_seating_project(v_project_id);

  insert into public.invitation_guests (
    project_id,
    invitation_id,
    group_id,
    recipient_id,
    first_name,
    last_name,
    notes,
    is_primary
  )
  values (
    v_project_id,
    p_invitation_id,
    p_group_id,
    null,
    v_first_name,
    v_last_name,
    v_notes,
    false
  )
  returning *
  into v_guest;


  -- =========================================
  -- Return
  -- =========================================

  return v_guest;

end;

$function$;
