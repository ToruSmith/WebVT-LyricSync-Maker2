/* ===== [WATER] 水波折射（WebGL2：initWater / waterText / waterGL，供 ripple-pool 使用）：文字畫到離屏 2D Canvas 當貼圖，fragment shader 依「時間」算出水波高度場並位移取樣。
   純時間函數（無累積狀態）；共用單一 canvas / context；不可用時回傳 false，由呼叫端改用 DOM 簡化版 ===== */
let WATER;
function initWater(){if(WATER!==undefined)return WATER;WATER=null;
 try{const cv=document.createElement("canvas"),gl=cv.getContext("webgl2",{alpha:true,premultipliedAlpha:true,preserveDrawingBuffer:true,antialias:false});if(!gl)return WATER;
  const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o};
  const pr=gl.createProgram();
  gl.attachShader(pr,sh(gl.VERTEX_SHADER,"#version 300 es\nin vec2 p;out vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}"));
  gl.attachShader(pr,sh(gl.FRAGMENT_SHADER,`#version 300 es
precision highp float;in vec2 uv;out vec4 o;
uniform sampler2D tx;uniform vec2 res;uniform float t,per,ph,pulse,alpha,disp;uniform vec3 ac;
void main(){
 vec2 px=uv*res,d=px-res*.5;float r=length(d);vec2 dir=r>.001?d/r:vec2(0.);
 float life=per*5.,w=res.y*.05,dmax=min(res.x,res.y)*.475,grad=0.,crest=0.;
 for(int i=0;i<7;i++){
  float te=ph+(floor((t-ph)/per)-float(i))*per,age=t-te;
  if(age<0.||age>life)continue;
  float u=age/life,R=dmax*(1.-pow(1.-u,2.2)),x=(r-R)/w,am=(1.-u)*(1.-u),g=exp(-x*x);
  grad+=am*g*(-3.14159*sin(3.14159*x)-2.*x*cos(3.14159*x));
  crest+=am*g;
 }
 vec2 q=(uv-.5)/(1.+.035*pulse)+.5;
 vec2 q2=q-dir*grad*disp/res;
 vec4 tc=texture(tx,q2)*alpha;
 float ra=clamp(crest*.55,0.,1.)*alpha;
 vec4 rg=vec4(mix(vec3(.8,.9,1.),ac,.4)*ra,ra);
 o=tc+rg*(1.-tc.a);
}`));
  gl.bindAttribLocation(pr,0,"p");gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(pr));
  const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]].forEach(([a,b])=>gl.texParameteri(gl.TEXTURE_2D,a,b));
  const u={};["tx","res","t","per","ph","pulse","alpha","disp","ac"].forEach(n=>u[n]=gl.getUniformLocation(pr,n));
  WATER={cv,gl,pr,tex,u}}catch(e){console.warn("WebGL2 不可用，水波折射改用簡化版：",e.message);WATER=null}
 return WATER}
function waterText(sb,z,W,H){const cv=document.createElement("canvas");cv.width=W;cv.height=H;const g=cv.getContext("2d"),st=(sb.st||"").split(","),
  rs=getComputedStyle(document.documentElement),col=rs.getPropertyValue("--c").trim()||"#fff",acc=rs.getPropertyValue("--a").trim()||"#7aa8ff",x=W/2+z*.06,y=H/2,t=sb.plain;
 g.font=`${CONFIG.weight} ${z}px ${FONTS[curFont||CONFIG.font]||CONFIG.font}`;g.textAlign="center";g.textBaseline="middle";if("letterSpacing"in g)g.letterSpacing=`${z*.12}px`;
 if(st.includes("longshadow")){g.fillStyle="#2b3f66";for(let i=30;i>=1;i--)g.fillText(t,x+i*.022*z,y+i*.022*z)}
 if(st.includes("chromatic")){g.fillStyle="rgba(255,40,90,.85)";g.fillText(t,x-.04*z,y);g.fillStyle="rgba(0,220,255,.85)";g.fillText(t,x+.04*z,y)}
 if((st.includes("neon")||st.includes("glow-soft"))&&!isChroma()){g.shadowColor=acc;g.shadowBlur=z*(st.includes("neon")?.5:.3)}
 if(st.includes("gradient")){const gr=g.createLinearGradient(x-W*.2,0,x+W*.2,0);gr.addColorStop(0,col);gr.addColorStop(1,acc);g.fillStyle=gr}else g.fillStyle=col;
 if(st.includes("outline")){g.strokeStyle=col;g.lineWidth=z*.04;g.strokeText(t,x,y)}
 else if(sb.hl&&sb.hl.some(Boolean)){const P=[...t];g.textAlign="left";const x0=x-g.measureText(t).width/2;P.forEach((ch,i)=>{const px=x0+g.measureText(P.slice(0,i).join("")).width;g.save();if(sb.hl[i]){g.fillStyle=acc;g.shadowColor=acc;g.shadowBlur=z*.35}g.fillText(ch,px,y);g.restore()})}
 else g.fillText(t,x,y);
 return cv}
function waterGL(sb,c,z,p,ph){
 if(CONFIG.waterRefract===false||perfLite||isChroma())return false;const Wt=initWater();if(!Wt)return false;
 const {cv,gl,pr,tex,u}=Wt,W=SWd(),H=SHd();if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H}
 cv.style.cssText="position:absolute;inset:0;width:100%;height:100%;pointer-events:none";c.appendChild(cv);
 const rs=getComputedStyle(document.documentElement).getPropertyValue("--a").trim()||"#7aa8ff",m=/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(rs),ac=m?[1,2,3].map(i=>parseInt(m[i],16)/255):[.48,.66,1];
 gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,waterText(sb,z,W,H));
 const per=p/1000,ph0=ph/1000,dur0=Math.max(.05,D()/1000);
 TICKS.push(t=>{const ct=Math.max(0,t-sb.s);gl.viewport(0,0,W,H);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(pr);gl.bindTexture(gl.TEXTURE_2D,tex);
  gl.uniform1i(u.tx,0);gl.uniform2f(u.res,W,H);gl.uniform1f(u.t,ct);gl.uniform1f(u.per,per);gl.uniform1f(u.ph,ph0);
  gl.uniform1f(u.pulse,Math.exp(-(((ct-ph0)%per+per)%per)/per*7));gl.uniform1f(u.alpha,Math.min(1,ct/dur0));gl.uniform1f(u.disp,H*.0042);gl.uniform3f(u.ac,ac[0],ac[1],ac[2]);
  gl.drawArrays(gl.TRIANGLES,0,3)});
 return true}
