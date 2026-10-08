create or replace function private.seating_geometry_fits(p_shape text,p_x integer,p_y integer,p_width integer,p_height integer,p_rotation integer,p_room_width integer,p_room_height integer) returns boolean language plpgsql immutable strict set search_path='' as $geometry$
declare v_half_x double precision;v_half_y double precision;v_angle double precision;v_epsilon constant double precision:=0.0000001;
begin
 if p_shape not in ('round','rectangle') or p_width not between 10 and 10000 or p_height not between 10 and 10000 or p_rotation not between 0 and 359 or p_room_width not between 100 and 100000 or p_room_height not between 100 and 100000 then return false;end if;
 if p_shape='round' then if p_width<>p_height then return false;end if;v_half_x:=p_width/2.0;v_half_y:=p_height/2.0;
 else v_angle:=radians(p_rotation::double precision);v_half_x:=(abs(cos(v_angle))*p_width+abs(sin(v_angle))*p_height)/2.0;v_half_y:=(abs(sin(v_angle))*p_width+abs(cos(v_angle))*p_height)/2.0;end if;
 return p_x-v_half_x>=-v_epsilon and p_y-v_half_y>=-v_epsilon and p_x+v_half_x<=p_room_width+v_epsilon and p_y+v_half_y<=p_room_height+v_epsilon;
end $geometry$;

-- Continue SAME transaction from 001. No commit.
create or replace function private.seating_authorize(p_project uuid) returns void language plpgsql security definer set search_path='' as $$ begin if auth.uid() is null or private.is_project_member(p_project,auth.uid()) is not true then raise exception 'Access denied' using errcode='42501'; end if; end $$;

create or replace function private.lock_seating_project(p_project uuid) returns void language plpgsql security definer set search_path='' as $$ begin perform private.seating_authorize(p_project); perform 1 from public.projects where id=p_project for update; if not found then raise exception 'Project missing' using errcode='P0002'; end if; end $$;

create or replace function public.manage_project_guest(p_project_id uuid,p_guest_id uuid,p_operation text,p_first_name text default null,p_last_name text default null,p_notes text default null) returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin perform private.lock_seating_project(p_project_id);
 if p_operation='create' then
 insert into public.project_guests(project_id,first_name,last_name,notes) values(p_project_id,trim(p_first_name),nullif(trim(p_last_name),''),nullif(trim(p_notes),'')) returning id into v_id; return v_id;
 end if;
 perform 1 from public.project_guests where project_id=p_project_id and id=p_guest_id for update;
 if not found then raise exception 'Guest missing' using errcode='P0002'; end if;
 case p_operation
 when 'update' then update public.project_guests set first_name=trim(p_first_name),last_name=nullif(trim(p_last_name),''),notes=nullif(trim(p_notes),''),updated_at=now() where id=p_guest_id;
 when 'archive' then update public.project_guests set archived_at=now(),updated_at=now() where id=p_guest_id;
 when 'restore' then update public.project_guests set archived_at=null,updated_at=now() where id=p_guest_id;
 when 'delete' then
 if private.is_project_owner(p_project_id,auth.uid()) is not true then raise exception 'Owner required' using errcode='42501'; end if;
 if exists(select 1 from public.invitation_guests where project_id=p_project_id and project_guest_id=p_guest_id) or exists(select 1 from public.invitation_generic_guest_links where project_id=p_project_id and project_guest_id=p_guest_id) or exists(select 1 from public.seating_plan_guests where project_id=p_project_id and project_guest_id=p_guest_id) then raise exception 'Person still linked' using errcode='23503'; end if;
 delete from public.project_guests where id=p_guest_id;
 else raise exception 'Invalid operation' using errcode='22023'; end case;
 return p_guest_id;
end $$;

create or replace function private.invitation_person_guard() returns trigger language plpgsql security definer set search_path='' as $$
declare v_person public.project_guests;
begin
 if tg_op='INSERT' and new.project_guest_id is null then
 insert into public.project_guests(project_id,first_name,last_name) values(new.project_id,new.first_name,new.last_name) returning id into new.project_guest_id;
 end if;
 if tg_op='UPDATE' and (new.project_id is distinct from old.project_id or new.invitation_id is distinct from old.invitation_id or new.project_guest_id is distinct from old.project_guest_id or new.id is distinct from old.id) then raise exception 'Guest identity immutable' using errcode='22023'; end if;
 select * into v_person from public.project_guests where project_id=new.project_id and id=new.project_guest_id;
 if not found then raise exception 'Person missing' using errcode='23503'; end if;
 if tg_op='INSERT' and v_person.archived_at is not null then raise exception 'Person archived' using errcode='22023'; end if;
 -- Stored compatibility names are derived snapshots. Only project_guests can edit names.
 new.first_name:=v_person.first_name; new.last_name:=v_person.last_name; return new;
end $$;

create or replace function private.sync_invitation_person_names() returns trigger language plpgsql security definer set search_path='' as $$ begin update public.invitation_guests set first_name=new.first_name,last_name=new.last_name,updated_at=now() where project_guest_id=new.id and project_id=new.project_id; return new; end $$;

create or replace function public.link_existing_invitation_guest(p_invitation_id uuid,p_project_guest_id uuid,p_group_id uuid default null) returns public.invitation_guests language plpgsql security definer set search_path='' as $$
declare v_project uuid; v_guest public.invitation_guests;
begin select project_id into v_project from public.invitations where id=p_invitation_id; perform private.lock_seating_project(v_project);
 perform 1 from public.project_guests where project_id=v_project and id=p_project_guest_id and archived_at is null; if not found then raise exception 'Active person missing' using errcode='22023'; end if;
 insert into public.invitation_guests(project_id,invitation_id,project_guest_id,first_name,last_name,group_id) select v_project,p_invitation_id,id,first_name,last_name,p_group_id from public.project_guests where id=p_project_guest_id returning * into v_guest; return v_guest;
end $$;

create or replace function public.link_generic_rsvp_guest(p_response_guest_id uuid,p_project_guest_id uuid default null,p_create_new boolean default false) returns uuid language plpgsql security definer set search_path='' as $$
declare v_row public.rsvp_response_guests; v_project uuid; v_person uuid;
begin
 select project_id into v_project from public.rsvp_response_guests where id=p_response_guest_id;
 perform private.lock_seating_project(v_project);
 select g.* into v_row from public.rsvp_response_guests g join public.rsvp_responses r on r.id=g.response_id where g.id=p_response_guest_id and r.response_type='generic' and g.invitation_guest_id is null for update of g;
 if not found then raise exception 'Generic guest missing' using errcode='22023'; end if;
 if exists(select 1 from public.invitation_generic_guest_links where response_guest_id=p_response_guest_id) then raise exception 'Already linked: unlink explicitly first' using errcode='23505'; end if;
 if p_create_new then
 if p_project_guest_id is not null then raise exception 'Choose existing or new' using errcode='22023'; end if;
 insert into public.project_guests(project_id,first_name,last_name) values(v_row.project_id,v_row.first_name,v_row.last_name) returning id into v_person;
 else
 v_person:=p_project_guest_id;
 perform 1 from public.project_guests where project_id=v_row.project_id and id=v_person and archived_at is null; if not found then raise exception 'Active person missing' using errcode='22023'; end if;
 end if;
 if not exists(select 1 from public.invitation_guests where invitation_id=v_row.invitation_id and project_guest_id=v_person) then perform public.link_existing_invitation_guest(v_row.invitation_id,v_person,null); end if;
 insert into public.invitation_generic_guest_links(project_id,invitation_id,response_id,response_guest_id,project_guest_id) values(v_row.project_id,v_row.invitation_id,v_row.response_id,v_row.id,v_person);
 return v_person;
end $$;

create or replace function public.unlink_generic_rsvp_guest(p_response_guest_id uuid) returns void language plpgsql security definer set search_path='' as $$ declare v_project uuid; begin select project_id into v_project from public.rsvp_response_guests where id=p_response_guest_id; perform private.lock_seating_project(v_project); delete from public.invitation_generic_guest_links where response_guest_id=p_response_guest_id; end $$;

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


CREATE OR REPLACE FUNCTION public.update_invitation_guest(p_guest_id uuid, p_group_id uuid, p_first_name text, p_last_name text, p_notes text)
 RETURNS invitation_guests
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$

declare
  v_user_id uuid;
  v_project_id uuid;
  v_invitation_id uuid;

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
  -- Guest
  -- =========================================

  select
    guest.project_id,
    guest.invitation_id
  into
    v_project_id,
    v_invitation_id
  from public.invitation_guests guest
  where guest.id =
    p_guest_id;

  if not found then
    raise exception
      'Gost nije pronađen.'
      using errcode = 'P0002';
  end if;


  -- =========================================
  -- Authorization
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
  -- =========================================

  if p_group_id is not null
    and not exists (
      select
        1
      from public.invitation_guest_groups guest_group
      where guest_group.project_id =
        v_project_id
        and guest_group.invitation_id =
          v_invitation_id
        and guest_group.id =
          p_group_id
    )
  then
    raise exception
      'Grupa gostiju nije pronađena u ovoj pozivnici.'
      using errcode = '22023';
  end if;


  -- =========================================
  -- Update Guest
  --
  -- Recipient / primary state are intentionally
  -- untouched by ordinary guest editing.
  -- =========================================

  perform private.lock_seating_project(v_project_id);
  update public.project_guests set first_name=v_first_name,last_name=v_last_name,updated_at=now() where id=(select project_guest_id from public.invitation_guests where id=p_guest_id);

  update public.invitation_guests
  set
    group_id =
      p_group_id,

    first_name =
      v_first_name,

    last_name =
      v_last_name,

    notes =
      v_notes
  where id =
    p_guest_id
  returning *
  into v_guest;


  -- =========================================
  -- Return
  -- =========================================

  return v_guest;

end;

$function$;


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


create or replace function private.lock_seating_plan(p_plan uuid,p_revision bigint) returns public.seating_plans language plpgsql security definer set search_path='' as $$ declare v public.seating_plans; v_project uuid; begin select project_id into v_project from public.seating_plans where id=p_plan; perform private.lock_seating_project(v_project); select * into v from public.seating_plans where id=p_plan for update; if not found then raise exception 'Plan missing' using errcode='P0002'; end if; if p_revision is null or v.revision<>p_revision then raise exception 'Revision conflict' using errcode='40001'; end if; return v; end $$;

create or replace function public.manage_seating_plan(p_project_id uuid,p_plan_id uuid,p_revision bigint,p_operation text,p_name text default null,p_width_cm integer default null,p_height_cm integer default null,p_rsvp_invitation_id uuid default null) returns jsonb language plpgsql security definer set search_path='' as $$ declare v public.seating_plans; begin
 perform private.lock_seating_project(p_project_id);
 if p_operation='create' then insert into public.seating_plans(project_id,name,width_cm,height_cm,rsvp_invitation_id) values(p_project_id,trim(p_name),p_width_cm,p_height_cm,p_rsvp_invitation_id) returning * into v;
 else v:=private.lock_seating_plan(p_plan_id,p_revision); if v.project_id<>p_project_id then raise exception 'Project mismatch' using errcode='42501'; end if;
 if p_operation='delete' then delete from public.seating_plans where id=v.id; return jsonb_build_object('id',v.id,'deleted',true); elsif p_operation='update' then
 if exists(select 1 from public.seating_tables where plan_id=v.id and (not private.seating_geometry_fits(shape,x_cm,y_cm,width_cm,height_cm,rotation_deg,p_width_cm,p_height_cm))) then raise exception 'Room too small' using errcode='22023'; end if;
 update public.seating_plans set name=trim(p_name),width_cm=p_width_cm,height_cm=p_height_cm,rsvp_invitation_id=p_rsvp_invitation_id,revision=revision+1,updated_at=now() where id=v.id returning * into v;
 else raise exception 'Invalid operation' using errcode='22023'; end if; end if; return to_jsonb(v); end $$;

create or replace function public.manage_seating_participant(p_plan_id uuid,p_revision bigint,p_guest_id uuid,p_operation text) returns bigint language plpgsql security definer set search_path='' as $$ declare v public.seating_plans; v_next bigint; begin v:=private.lock_seating_plan(p_plan_id,p_revision);
 if p_operation='add' then perform 1 from public.project_guests where project_id=v.project_id and id=p_guest_id and archived_at is null; if not found then raise exception 'Active person missing' using errcode='22023'; end if;
 insert into public.seating_plan_guests values(v.project_id,v.id,p_guest_id);
 elsif p_operation='remove' then delete from public.seating_plan_guests where plan_id=v.id and project_guest_id=p_guest_id;
 else raise exception 'Invalid operation' using errcode='22023'; end if;
 update public.seating_plans set revision=revision+1,updated_at=now() where id=v.id returning revision into v_next; return v_next; end $$;

create or replace function public.manage_seating_table(p_plan_id uuid,p_revision bigint,p_table_id uuid,p_operation text,p_name text default null,p_shape text default null,p_capacity integer default null,p_x_cm integer default null,p_y_cm integer default null,p_width_cm integer default null,p_height_cm integer default null,p_rotation_deg integer default 0) returns jsonb language plpgsql security definer set search_path='' as $$ declare v public.seating_plans; v_id uuid; v_next bigint; begin v:=private.lock_seating_plan(p_plan_id,p_revision);
 if p_operation in ('update','delete') then perform 1 from public.seating_tables where plan_id=v.id and id=p_table_id; if not found then raise exception 'Table missing' using errcode='P0002'; end if; end if;
 if p_operation='delete' then delete from public.seating_tables where plan_id=v.id and id=p_table_id; v_id:=p_table_id;
 elsif p_operation in ('create','update') then
 if p_x_cm is null or p_y_cm is null or p_width_cm is null or p_height_cm is null or p_capacity is null or p_shape is null or p_rotation_deg is null or not private.seating_geometry_fits(p_shape,p_x_cm,p_y_cm,p_width_cm,p_height_cm,p_rotation_deg,v.width_cm,v.height_cm) or (p_shape='round' and p_width_cm<>p_height_cm) then raise exception 'Invalid table geometry' using errcode='22023'; end if;
 if p_operation='create' then insert into public.seating_tables(project_id,plan_id,name,shape,capacity,x_cm,y_cm,width_cm,height_cm,rotation_deg) values(v.project_id,v.id,trim(p_name),p_shape,p_capacity,p_x_cm,p_y_cm,p_width_cm,p_height_cm,p_rotation_deg) returning id into v_id;
 else
 if (select count(*) from public.seating_assignments where plan_id=v.id and table_id=p_table_id)>p_capacity then raise exception 'Capacity below occupancy' using errcode='22023'; end if;
 update public.seating_tables set name=trim(p_name),shape=p_shape,capacity=p_capacity,x_cm=p_x_cm,y_cm=p_y_cm,width_cm=p_width_cm,height_cm=p_height_cm,rotation_deg=p_rotation_deg where plan_id=v.id and id=p_table_id; v_id:=p_table_id;
 end if;
 else raise exception 'Invalid operation' using errcode='22023'; end if;
 update public.seating_plans set revision=revision+1,updated_at=now() where id=v.id returning revision into v_next; return jsonb_build_object('id',v_id,'revision',v_next); end $$;

create or replace function public.assign_seating_guest(p_plan_id uuid,p_revision bigint,p_guest_id uuid,p_table_id uuid) returns bigint language plpgsql security definer set search_path='' as $$ declare v public.seating_plans; v_capacity integer; v_next bigint; begin v:=private.lock_seating_plan(p_plan_id,p_revision);
 if p_table_id is null then delete from public.seating_assignments where plan_id=v.id and project_guest_id=p_guest_id;
 else
 perform 1 from public.project_guests where project_id=v.project_id and id=p_guest_id and archived_at is null; if not found then raise exception 'Active person missing' using errcode='22023'; end if;
 select capacity into v_capacity from public.seating_tables where plan_id=v.id and id=p_table_id; if not found then raise exception 'Table missing' using errcode='22023'; end if;
 if (select count(*) from public.seating_assignments where plan_id=v.id and table_id=p_table_id and project_guest_id<>p_guest_id)>=v_capacity then raise exception 'Table full' using errcode='22023'; end if;
 insert into public.seating_assignments values(v.project_id,v.id,p_guest_id,p_table_id) on conflict(plan_id,project_guest_id) do update set table_id=excluded.table_id;
 end if;
 update public.seating_plans set revision=revision+1,updated_at=now() where id=v.id returning revision into v_next; return v_next; end $$;

create or replace function private.seating_plan_guard() returns trigger language plpgsql security definer set search_path='' as $$ begin if new.id is distinct from old.id or new.project_id is distinct from old.project_id then raise exception 'Plan identity immutable' using errcode='22023'; end if; if new.rsvp_invitation_id is distinct from old.rsvp_invitation_id and new.revision=old.revision then new.revision:=old.revision+1;new.updated_at:=now(); end if; return new; end $$;

create or replace function private.generic_guest_link_guard() returns trigger language plpgsql security definer set search_path='' as $$ begin if not exists(select 1 from public.rsvp_response_guests g join public.rsvp_responses r on r.id=g.response_id and r.project_id=g.project_id and r.invitation_id=g.invitation_id where g.id=new.response_guest_id and g.project_id=new.project_id and g.invitation_id=new.invitation_id and g.response_id=new.response_id and g.invitation_guest_id is null and r.response_type='generic') then raise exception 'Not a generic response guest' using errcode='22023'; end if; return new; end $$;
create trigger invitation_person_guard before insert or update on public.invitation_guests for each row execute function private.invitation_person_guard();
create trigger sync_invitation_person_names after update of first_name,last_name on public.project_guests for each row when(old.first_name is distinct from new.first_name or old.last_name is distinct from new.last_name) execute function private.sync_invitation_person_names();
create trigger seating_plan_guard before update on public.seating_plans for each row execute function private.seating_plan_guard();
create trigger generic_guest_link_guard before insert or update on public.invitation_generic_guest_links for each row execute function private.generic_guest_link_guard();
-- NEW: template validation and atomic copy.
create or replace function private.validate_seating_template(p_document jsonb,p_version integer) returns void
language plpgsql security definer set search_path='' as $template$
declare v_item jsonb; v_width integer; v_height integer; v_x integer; v_y integer; v_w integer; v_h integer;
begin
 if p_version is distinct from 1 or p_document is null or jsonb_typeof(p_document)<>'object' then raise exception 'Unsupported template document' using errcode='22023'; end if;
 if not(p_document ?& array['width_cm','height_cm','tables']) or exists(select 1 from jsonb_object_keys(p_document) k where k not in ('width_cm','height_cm','tables')) then raise exception 'Invalid template fields' using errcode='22023'; end if;
 if jsonb_typeof(p_document->'width_cm')<>'number' or jsonb_typeof(p_document->'height_cm')<>'number' or (p_document->>'width_cm') !~ '^[0-9]{1,6}$' or (p_document->>'height_cm') !~ '^[0-9]{1,6}$' or jsonb_typeof(p_document->'tables')<>'array' then raise exception 'Invalid template dimensions' using errcode='22023'; end if;
 v_width:=(p_document->>'width_cm')::integer;v_height:=(p_document->>'height_cm')::integer;
 if v_width not between 100 and 100000 or v_height not between 100 and 100000 or jsonb_array_length(p_document->'tables')>200 then raise exception 'Template limits exceeded' using errcode='22023'; end if;
 for v_item in select value from jsonb_array_elements(p_document->'tables') loop
 if jsonb_typeof(v_item)<>'object' then raise exception 'Invalid template table' using errcode='22023'; end if;
 if not(v_item ?& array['name','shape','capacity','x_cm','y_cm','width_cm','height_cm','rotation_deg']) or exists(select 1 from jsonb_object_keys(v_item) k where k not in ('name','shape','capacity','x_cm','y_cm','width_cm','height_cm','rotation_deg')) then raise exception 'Invalid table fields' using errcode='22023'; end if;
 if jsonb_typeof(v_item->'name')<>'string' or char_length(trim(v_item->>'name')) not between 1 and 150 or jsonb_typeof(v_item->'shape')<>'string' or (v_item->>'shape') not in ('round','rectangle') then raise exception 'Invalid table identity' using errcode='22023'; end if;
 if exists(select 1 from unnest(array['capacity','x_cm','y_cm','width_cm','height_cm','rotation_deg']) k where jsonb_typeof(v_item->k)<>'number' or (v_item->>k) !~ '^[0-9]{1,6}$') then raise exception 'Invalid table numbers' using errcode='22023'; end if;
 v_x:=(v_item->>'x_cm')::integer;v_y:=(v_item->>'y_cm')::integer;v_w:=(v_item->>'width_cm')::integer;v_h:=(v_item->>'height_cm')::integer;
 if (v_item->>'capacity')::integer not between 1 and 100 or (v_item->>'rotation_deg')::integer not between 0 and 359 or v_w not between 10 and 10000 or v_h not between 10 and 10000 or not private.seating_geometry_fits(v_item->>'shape',v_x,v_y,v_w,v_h,(v_item->>'rotation_deg')::integer,v_width,v_height) or ((v_item->>'shape')='round' and v_w<>v_h) then raise exception 'Invalid table geometry' using errcode='22023'; end if;
 end loop;
end $template$;
create or replace function private.seating_template_guard() returns trigger language plpgsql security definer set search_path='' as $template$
begin perform private.validate_seating_template(new.document,new.document_version);new.updated_at:=now();return new;end $template$;
create or replace function public.create_seating_plan_from_template(p_project_id uuid,p_template_id uuid,p_name text,p_rsvp_invitation_id uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $template$
declare v_template public.seating_templates;v_plan public.seating_plans;v_item jsonb;
begin
 perform private.lock_seating_project(p_project_id);
 select * into v_template from public.seating_templates where id=p_template_id and is_active for share;
 if not found then raise exception 'Active template missing' using errcode='P0002'; end if;
 perform private.validate_seating_template(v_template.document,v_template.document_version);
 insert into public.seating_plans(project_id,name,rsvp_invitation_id,width_cm,height_cm)
 values(p_project_id,trim(p_name),p_rsvp_invitation_id,(v_template.document->>'width_cm')::integer,(v_template.document->>'height_cm')::integer) returning * into v_plan;
 for v_item in select value from jsonb_array_elements(v_template.document->'tables') loop
 insert into public.seating_tables(project_id,plan_id,name,shape,capacity,x_cm,y_cm,width_cm,height_cm,rotation_deg)
 values(p_project_id,v_plan.id,trim(v_item->>'name'),v_item->>'shape',(v_item->>'capacity')::integer,(v_item->>'x_cm')::integer,(v_item->>'y_cm')::integer,(v_item->>'width_cm')::integer,(v_item->>'height_cm')::integer,(v_item->>'rotation_deg')::integer);
 end loop;
 return to_jsonb(v_plan);
end $template$;
create trigger seating_template_guard before insert or update on public.seating_templates for each row execute function private.seating_template_guard();
