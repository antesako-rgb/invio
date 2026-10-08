export type SeatingGeometry={shape:"round"|"rectangle";x_cm:number;y_cm:number;width_cm:number;height_cm:number;rotation_deg:number};
/** x/y are the center in cm, rotation in degrees clockwise around that center. */
export function seatingGeometryFits(t:SeatingGeometry,roomWidth:number,roomHeight:number){
 const values=[t.x_cm,t.y_cm,t.width_cm,t.height_cm,t.rotation_deg,roomWidth,roomHeight];
 if(!values.every(Number.isFinite)||t.width_cm<10||t.width_cm>10000||t.height_cm<10||t.height_cm>10000||t.rotation_deg<0||t.rotation_deg>359||roomWidth<100||roomWidth>100000||roomHeight<100||roomHeight>100000)return false;
 if(t.shape==="round"&&t.width_cm!==t.height_cm)return false;
 const angle=t.rotation_deg*Math.PI/180;
 const halfX=t.shape==="round"?t.width_cm/2:(Math.abs(Math.cos(angle))*t.width_cm+Math.abs(Math.sin(angle))*t.height_cm)/2;
 const halfY=t.shape==="round"?t.height_cm/2:(Math.abs(Math.sin(angle))*t.width_cm+Math.abs(Math.cos(angle))*t.height_cm)/2;
 const epsilon=0.0000001;
 return t.x_cm-halfX>=-epsilon&&t.y_cm-halfY>=-epsilon&&t.x_cm+halfX<=roomWidth+epsilon&&t.y_cm+halfY<=roomHeight+epsilon;
}
