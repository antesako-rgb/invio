-- PROPOSED DEFINITION; NOT INSTALLED.
create or replace function private.seating_geometry_fits(p_shape text,p_x integer,p_y integer,p_width integer,p_height integer,p_rotation integer,p_room_width integer,p_room_height integer) returns boolean language plpgsql immutable strict set search_path='' as $geometry$
declare v_half_x double precision;v_half_y double precision;v_angle double precision;v_epsilon constant double precision:=0.0000001;
begin
 if p_shape not in ('round','rectangle') or p_width not between 10 and 10000 or p_height not between 10 and 10000 or p_rotation not between 0 and 359 or p_room_width not between 100 and 100000 or p_room_height not between 100 and 100000 then return false;end if;
 if p_shape='round' then if p_width<>p_height then return false;end if;v_half_x:=p_width/2.0;v_half_y:=p_height/2.0;
 else v_angle:=radians(p_rotation::double precision);v_half_x:=(abs(cos(v_angle))*p_width+abs(sin(v_angle))*p_height)/2.0;v_half_y:=(abs(sin(v_angle))*p_width+abs(cos(v_angle))*p_height)/2.0;end if;
 return p_x-v_half_x>=-v_epsilon and p_y-v_half_y>=-v_epsilon and p_x+v_half_x<=p_room_width+v_epsilon and p_y+v_half_y<=p_room_height+v_epsilon;
end $geometry$;
