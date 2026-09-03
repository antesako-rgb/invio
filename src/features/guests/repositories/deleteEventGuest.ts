import { 
  createServerClient, 
} from "@/lib/supabase/server"; 
 
 
/* ========================================================================== 
   Delete Event Guest 
========================================================================== */ 
 
export async function deleteEventGuest( 
  guestId: string 
): Promise<void> { 
  const supabase = 
    await createServerClient(); 
 
  const { 
    error, 
  } = 
    await supabase.rpc( 
      "delete_event_guest", 
      { 
        p_guest_id: 
          guestId, 
      } 
    ); 
 
  if (error) { 
    console.error( 
      "deleteEventGuest error:", 
      error 
    ); 
 
    throw new Error( 
      error.message 
    ); 
  } 
}