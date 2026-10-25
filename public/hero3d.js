(function(){
  var THREE_URL='https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  var RED=0xCC0000;

  function boot(){
    var hero=document.querySelector('.hero');
    if(!hero){return setTimeout(boot,80);}
    if(hero.querySelector('canvas.hero3d')) return;
    var s=document.createElement('script');
    s.src=THREE_URL; s.onload=function(){ try{ init(hero); }catch(e){
      console.warn('hero3d failed',e);
      // Static fallback: hide the empty canvas, hero keeps its plain CSS background
      var c=hero.querySelector('canvas.hero3d'); if(c) c.style.display='none';
      hero.removeAttribute('data-hero3d');
    } };
    s.onerror=function(){ console.warn('hero3d: three.js failed to load'); };
    document.head.appendChild(s);
  }

  function init(hero){
    var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canvas=document.createElement('canvas');
    canvas.className='hero3d';
    canvas.setAttribute('aria-hidden','true');
    hero.insertBefore(canvas,hero.firstChild);

    // Re-attach if the host framework re-renders the hero
    new MutationObserver(function(){ if(!canvas.isConnected){ var h=document.querySelector('.hero'); if(h) h.insertBefore(canvas,h.firstChild);} }).observe(document.body,{childList:true,subtree:true});

    var renderer=new THREE.WebGLRenderer({canvas:canvas,antialias:true,alpha:true});
    hero.setAttribute('data-hero3d','on');
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.outputEncoding=THREE.sRGBEncoding;
    renderer.toneMapping=THREE.ACESFilmicToneMapping; renderer.toneMappingExposure=1.15;
    var scene=new THREE.Scene();
    var camera=new THREE.PerspectiveCamera(35,1,0.1,100);
    camera.position.set(0,0,14);

    // ---------- Studio environment (procedural HDRI) ----------
    try{
      var pmrem=new THREE.PMREMGenerator(renderer);
      var envScene=new THREE.Scene();
      envScene.add(new THREE.Mesh(new THREE.SphereGeometry(50,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,
        vertexShader:'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
        fragmentShader:'varying vec3 vP;void main(){float h=vP.y*.5+.5;vec3 c=mix(vec3(.30,.31,.34),vec3(.92,.93,.98),smoothstep(.0,.9,h));gl_FragColor=vec4(c,1.);}'})));
      function softbox(w,h,x,y,z,r,g,bl){
        var m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({side:THREE.DoubleSide}));
        m.material.color.setRGB(r,g,bl); m.position.set(x,y,z); m.lookAt(0,0,0); envScene.add(m);
      }
      softbox(26,14,0,24,6,9,9,9);        // big overhead key
      softbox(8,22,-24,4,10,6,6,6.5);     // left strip
      softbox(8,22,24,2,-6,4.5,1.6,1.3);  // warm red kicker (brand colour)
      softbox(30,5,0,-4,-24,5,5,6);       // back rim strip
      softbox(18,6,0,-2,26,2.2,2.2,2.4);  // soft front fill
      scene.environment=pmrem.fromScene(envScene,0.035).texture;
      pmrem.dispose();
    }catch(e){ console.warn('env failed',e); }

    // ---------- Lights (supporting the environment) ----------
    scene.add(new THREE.HemisphereLight(0xffffff,0xdfe0e6,0.25));
    var key=new THREE.DirectionalLight(0xffffff,0.9); key.position.set(4,6,8); scene.add(key);
    var rim=new THREE.PointLight(0xff3b3b,0.7,30); rim.position.set(-6,-2,5); scene.add(rim);

    // ---------- Procedural detail textures ----------
    function canvasTex(w,h,draw,rx,ry){
      var c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h);
      var t=new THREE.CanvasTexture(c); t.wrapS=t.wrapT=THREE.RepeatWrapping; t.repeat.set(rx||1,ry||1);
      t.anisotropy=4; return t;
    }
    var noiseTex=canvasTex(256,256,function(g,w,h){ var d=g.createImageData(w,h);
      for(var i=0;i<d.data.length;i+=4){ var v=110+Math.random()*50; d.data[i]=d.data[i+1]=d.data[i+2]=v; d.data[i+3]=255; } g.putImageData(d,0,0); },10,10);
    var weaveTex=canvasTex(128,128,function(g,w,h){ g.fillStyle='#808080'; g.fillRect(0,0,w,h);
      for(var i=0;i<w;i+=8){ for(var j=0;j<h;j+=8){ g.fillStyle=((i+j)/8)%2?'#b8b8b8':'#505050'; g.fillRect(i+1,j+1,6,6); } } },5,5);
    var brushTex=canvasTex(256,256,function(g,w,h){ g.fillStyle='#b0b0b0'; g.fillRect(0,0,w,h);
      for(var i=0;i<900;i++){ var v=150+Math.random()*100|0; g.strokeStyle='rgb('+v+','+v+','+v+')'; g.globalAlpha=0.35;
        var y=Math.random()*h; g.beginPath(); g.moveTo(0,y); g.lineTo(w,y+Math.random()*2-1); g.stroke(); } },2,2);

    // ---------- Materials ----------
    var mRed=new THREE.MeshPhysicalMaterial({color:0xC40000,roughness:0.42,metalness:0.0,clearcoat:1,clearcoatRoughness:0.06,bumpMap:noiseTex,bumpScale:0.35,envMapIntensity:1.1});
    var mDark=new THREE.MeshStandardMaterial({color:0x17191d,roughness:0.55,metalness:0.2,envMapIntensity:0.9});
    var mVisor=new THREE.MeshPhysicalMaterial({color:0x0b0d12,roughness:0.04,metalness:0.7,clearcoat:1,transparent:true,opacity:0.92,envMapIntensity:1.6});
    var mMetal=new THREE.MeshStandardMaterial({color:0xcfd3da,roughness:0.55,roughnessMap:brushTex,metalness:1,envMapIntensity:1.4});
    var mWhite=new THREE.MeshStandardMaterial({color:0xf2f2f4,roughness:0.5});
    var mBag=new THREE.MeshPhysicalMaterial({color:0xC40000,roughness:0.65,metalness:0,sheen:new THREE.Color(0xff5a5a),bumpMap:weaveTex,bumpScale:0.8});

    // ---------- Helmet (vented road/courier bike helmet) ----------
    var helmet=new THREE.Group();
    var hInner=new THREE.Group(); hInner.position.y=-0.2; helmet.add(hInner);
    var RX=1.1, RY=0.95, RZ=1.5;
    // ellipsoid point with a tapered, dropped tail
    function hp(x,y,z,k){
      var px=x*RX*k, py=y*RY*k, pz=z*RZ*k;
      if(pz<0){ var r=-pz/RZ; var t=1-0.30*Math.pow(r,1.6); px*=t; py=py*t-0.16*r*r; }
      return new THREE.Vector3(px,py,pz);
    }
    function surf(a,b,k){ return hp(Math.sin(a)*Math.cos(b),Math.cos(a)*Math.cos(b),Math.sin(b),k||1); }
    function buildShell(k,side,mat){
      var g=new THREE.SphereGeometry(1,72,52,0,Math.PI*2,0,Math.PI*0.66);
      g.rotateY(-Math.PI/2); // hide texture seam at the back
      var p=g.attributes.position;
      for(var i=0;i<p.count;i++){ var v=hp(p.getX(i),p.getY(i),p.getZ(i),k); p.setXYZ(i,v.x,v.y,v.z); }
      g.computeVertexNormals();
      var m=mat.clone(); m.side=side;
      return new THREE.Mesh(g,m);
    }
    hInner.add(buildShell(1,THREE.FrontSide,mRed));
    hInner.add(buildShell(0.94,THREE.BackSide,new THREE.MeshStandardMaterial({color:0x2a2d33,roughness:0.9})));
    // foam trim around the open edge
    var edge=[]; for(var q=0;q<=64;q++){ var ph=q/64*Math.PI*2, th=Math.PI*0.66;
      edge.push(hp(-Math.cos(ph)*Math.sin(th),Math.cos(th),Math.sin(ph)*Math.sin(th),0.985)); }
    hInner.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge,true),128,0.055,10,true),new THREE.MeshStandardMaterial({color:0xe9e9ec,roughness:0.85})));
    // vent channels running front to back
    [[0,0.075],[0.42,0.06],[-0.42,0.06],[0.82,0.05],[-0.82,0.05]].forEach(function(c){
      var pts=[]; for(var n=0;n<=16;n++){ var bb=-1.0+n/16*1.85; pts.push(surf(c[0],bb,1.012)); }
      var tube=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,c[1],10,false),mDark);
      hInner.add(tube);
    });
    // white accent ridge down the middle between vents
    [0.21,-0.21].forEach(function(a2){
      var pts=[]; for(var n=0;n<=16;n++){ pts.push(surf(a2,-0.85+n/16*1.6,1.006)); }
      hInner.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),48,0.022,8,false),mWhite));
    });
    // front peak / visor
    var peakGeo=new THREE.RingGeometry(0.95,1.42,48,1,Math.PI*1.5-0.85,1.7);
    var peak=new THREE.Mesh(peakGeo,new THREE.MeshStandardMaterial({color:0x14161a,roughness:0.4,metalness:0.3,side:THREE.DoubleSide}));
    peak.rotation.x=-Math.PI/2; peak.scale.set(RX*1.0,RZ*0.62,1);
    var peakG=new THREE.Group(); peakG.add(peak); peakG.position.set(0,0.12,0.55); peakG.rotation.x=-0.22; hInner.add(peakG);
    // rear dial
    var dial=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.2,0.1,24),mDark);
    dial.rotation.x=Math.PI/2-0.35; dial.position.set(0,-0.38,-1.28); hInner.add(dial);
    // straps + buckle
    var strapMat=new THREE.MeshStandardMaterial({color:0x1d2025,roughness:0.8});
    [-1,1].forEach(function(sd){
      var yj=new THREE.Vector3(sd*1.0,-1.02,0.18);
      [new THREE.Vector3(sd*0.95,-0.5,0.78), new THREE.Vector3(sd*0.9,-0.52,-0.55)].forEach(function(st){
        var c=new THREE.QuadraticBezierCurve3(st,new THREE.Vector3(sd*1.12,(st.y+yj.y)/2,(st.z+yj.z)/2),yj);
        hInner.add(new THREE.Mesh(new THREE.TubeGeometry(c,16,0.035,6,false),strapMat));
      });
      var chin=new THREE.QuadraticBezierCurve3(yj,new THREE.Vector3(sd*0.7,-1.5,0.55),new THREE.Vector3(sd*0.14,-1.38,0.75));
      hInner.add(new THREE.Mesh(new THREE.TubeGeometry(chin,20,0.035,6,false),strapMat));
    });
    var buckle=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.2,0.1),mRed); buckle.position.set(0,-1.38,0.78); hInner.add(buckle);
    helmet.scale.setScalar(1);
    helmet.rotation.set(0.15,0.5,0);
    scene.add(helmet);

    // ---------- U-lock ----------
    var lock=new THREE.Group();
    var shackle=new THREE.Mesh(new THREE.TorusGeometry(0.62,0.12,20,48,Math.PI),mMetal);
    shackle.position.y=0.5; lock.add(shackle);
    [-0.62,0.62].forEach(function(x){
      var leg=new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,1,20),mMetal);
      leg.position.set(x,0,0); lock.add(leg);
    });
    var body=new THREE.Mesh(new THREE.BoxGeometry(1.7,0.62,0.5),mRed);
    body.position.y=-0.75; lock.add(body);
    var keyhole=new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.06,20),mDark);
    keyhole.rotation.x=Math.PI/2; keyhole.position.set(0,-0.75,0.27); lock.add(keyhole);
    var slot=new THREE.Mesh(new THREE.BoxGeometry(0.04,0.2,0.06),mDark);
    slot.position.set(0,-0.88,0.27); lock.add(slot);
    lock.rotation.set(0.1,-0.5,0.25);
    scene.add(lock);

    // ---------- Delivery bag ----------
    var bag=new THREE.Group();
    var bBody=new THREE.Mesh(new THREE.BoxGeometry(1.5,1.5,1.5),mBag);
    var bLid=new THREE.Mesh(new THREE.BoxGeometry(1.58,0.22,1.58),mDark); bLid.position.y=0.78;
    var bBand=new THREE.Mesh(new THREE.BoxGeometry(1.54,0.18,1.54),mWhite); bBand.position.y=0.1;
    var bHandle=new THREE.Mesh(new THREE.TorusGeometry(0.3,0.04,12,28,Math.PI),mDark); bHandle.position.y=0.9;
    bag.add(bBody,bLid,bBand,bHandle);
    bag.scale.setScalar(0.85);
    bag.rotation.set(0.35,0.6,0.1);
    scene.add(bag);

    // ---------- Soft ground shadows ----------
    var shTex=canvasTex(128,128,function(g,w,h){ var gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
      gr.addColorStop(0,'rgba(20,24,34,0.55)'); gr.addColorStop(1,'rgba(20,24,34,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); });
    function mkShadow(){ var m=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:shTex,transparent:true,depthWrite:false,opacity:0.5}));
      m.renderOrder=-1; scene.add(m); return m; }
    var shHelmet=mkShadow(), shLock=mkShadow(), shBag=mkShadow(), curSc=1;
    function placeShadow(sh,obj,drop,wid){ sh.position.set(obj.position.x+0.15*curSc,obj.position.y-drop*curSc,obj.position.z-1.5);
      var lift=Math.max(0,Math.min(1,(obj.position.y)*0)); sh.scale.set(wid*curSc,wid*0.22*curSc,1); }

    // ---------- Route line + rider dot ----------
    var pts=[];
    for(var k=0;k<=8;k++){ var t=k/8; pts.push(new THREE.Vector3((t-0.5)*22,Math.sin(t*Math.PI*2.2)*1.6-2.6,-2-Math.cos(t*5)*0.8)); }
    var curve=new THREE.CatmullRomCurve3(pts);
    var route=new THREE.Mesh(new THREE.TubeGeometry(curve,160,0.025,8,false),new THREE.MeshBasicMaterial({color:RED,transparent:true,opacity:0.28}));
    scene.add(route);
    var dots=[];
    for(var d=0;d<3;d++){
      var dm=new THREE.Mesh(new THREE.SphereGeometry(0.11,16,16),new THREE.MeshBasicMaterial({color:RED}));
      var halo=new THREE.Mesh(new THREE.SphereGeometry(0.26,16,16),new THREE.MeshBasicMaterial({color:RED,transparent:true,opacity:0.18}));
      dm.add(halo); scene.add(dm); dots.push({m:dm,off:d/3});
    }

    // ---------- Floating particles ----------
    var N=70, pg=new THREE.BufferGeometry(), pos=new Float32Array(N*3), seeds=[];
    for(var p=0;p<N;p++){ pos[p*3]=(Math.random()-0.5)*20; pos[p*3+1]=(Math.random()-0.5)*9; pos[p*3+2]=-4+Math.random()*5; seeds.push(Math.random()*6.28); }
    pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
    var particles=new THREE.Points(pg,new THREE.PointsMaterial({color:RED,size:0.07,transparent:true,opacity:0.45,sizeAttenuation:true}));
    scene.add(particles);

    // ---------- Optional real assets (drop-in GLB models + HDRI) ----------
    // Put files next to this page and fill in the paths. Anything left as '' or
    // missing silently falls back to the built-in procedural objects.
    var ASSETS={
      helmet:'./models/helmet.glb',      // target size in world units below
      lock:  './models/ulock.glb',
      bag:   './models/delivery-bag.glb',
      hdri:  './env/studio.hdr'          // equirectangular .hdr (e.g. from Poly Haven)
    };
    var SIZES={helmet:3.3,lock:3.0,bag:2.0};
    function loadScript(u){ return new Promise(function(res,rej){ var t=document.createElement('script'); t.src=u; t.onload=res; t.onerror=rej; document.head.appendChild(t); }); }
    var EX='https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/';
    function useModel(url,group,size){
      if(!url) return;
      new THREE.GLTFLoader().load(url,function(g){
        var m=g.scene, box=new THREE.Box3().setFromObject(m), sz=box.getSize(new THREE.Vector3()), c=box.getCenter(new THREE.Vector3());
        var k=size/Math.max(sz.x,sz.y,sz.z); m.scale.setScalar(k); m.position.sub(c.multiplyScalar(k));
        m.traverse(function(o){ if(o.isMesh){ o.material.envMapIntensity=1.2; if(o.material.map) o.material.map.encoding=THREE.sRGBEncoding; } });
        group.children.slice().forEach(function(ch){ ch.visible=false; });
        var w=new THREE.Group(); w.add(m); group.add(w);
      },undefined,function(){ /* keep procedural fallback */ });
    }
    loadScript(EX+'GLTFLoader.js').then(function(){
      useModel(ASSETS.helmet,helmet,SIZES.helmet);
      useModel(ASSETS.lock,lock,SIZES.lock);
      useModel(ASSETS.bag,bag,SIZES.bag);
    }).catch(function(){});
    if(ASSETS.hdri){
      loadScript(EX+'RGBELoader.js').then(function(){
        new THREE.RGBELoader().setDataType(THREE.UnsignedByteType).load(ASSETS.hdri,function(tex){
          var pm=new THREE.PMREMGenerator(renderer);
          scene.environment=pm.fromEquirectangular(tex).texture; tex.dispose(); pm.dispose();
        },undefined,function(){});
      }).catch(function(){});
    }

    // ---------- Delivery route city ----------
    var MODE='route'; // 'route' = map + delivery route | 'gear' = helmet/lock/bag | 'both'
    scene.fog=new THREE.Fog(0xf9fafb,16,30);
    var city=new THREE.Group(); scene.add(city);
    var CW=44, CH=30;
    function riverC(t){ return new THREE.Vector3(t*CW-CW/2,0,Math.sin(t*3.4+0.7)*3.4+2.5); }
    function hwC(t){ return new THREE.Vector3(t*CW-CW/2,0,-4.5+t*2.6+Math.sin(t*5)*0.6); }
    var riverPts=[], hwPts=[];
    for(var ti=0;ti<=120;ti++){ riverPts.push(riverC(ti/120)); hwPts.push(hwC(ti/120)); }
    function minDist(px,pz,arr){ var m=1e9; for(var i=0;i<arr.length;i++){ var dx=arr[i].x-px,dz=arr[i].z-pz,d=dx*dx+dz*dz; if(d<m)m=d; } return Math.sqrt(m); }
    function basic(c,o){ return new THREE.MeshBasicMaterial(Object.assign({color:c,toneMapped:false},o||{})); }
    function std(c,o){ return new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:0.9,metalness:0,envMapIntensity:0.4,toneMapped:false},o||{})); }

    // ground with soft elliptical fade
    var gMask=canvasTex(256,256,function(g,w,h){ var gr=g.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);
      gr.addColorStop(0,'#fff'); gr.addColorStop(0.62,'#fff'); gr.addColorStop(1,'#000'); g.fillStyle=gr; g.fillRect(0,0,w,h); });
    gMask.wrapS=gMask.wrapT=THREE.ClampToEdgeWrapping;
    var ground=new THREE.Mesh(new THREE.PlaneGeometry(CW+8,CH+8),basic(0xe9ecf2,{transparent:true,alphaMap:gMask,depthWrite:false}));
    ground.rotation.x=-Math.PI/2; ground.renderOrder=-2; city.add(ground);

    // ribbons (river + highway)
    function ribbon(fn,w,y,mat){
      var pos=[],idx=[],N=120;
      for(var i=0;i<=N;i++){ var t=i/N,p=fn(t),q=fn(Math.min(1,t+0.005)),p0=fn(Math.max(0,t-0.005));
        var tx=q.x-p0.x,tz=q.z-p0.z,L=Math.hypot(tx,tz)||1,nx=-tz/L,nz=tx/L;
        pos.push(p.x+nx*w/2,y,p.z+nz*w/2,p.x-nx*w/2,y,p.z-nz*w/2);
        if(i<N){ var a=i*2; idx.push(a,a+2,a+1,a+1,a+2,a+3); } }
      var g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3)); g.setIndex(idx); g.computeVertexNormals();
      return new THREE.Mesh(g,mat);
    }
    city.add(ribbon(riverC,1.6,0.02,basic(0x7fb4e6)));
    city.add(ribbon(hwC,0.95,0.04,basic(0x9aa4d6)));
    city.add(ribbon(hwC,0.07,0.05,basic(0xffffff)));

    // blocks, parks, trees
    var parks=[[-13,-10,2,6],[8,13,-9,-5],[-4,0,-13,-10]], blds=[], parkCells=[];
    for(var bi=-CW/2;bi<CW/2;bi++){ for(var bj=-CH/2;bj<CH/2;bj++){
      var cx=bi+0.5, cz=bj+0.5;
      if((((bi%5)+5)%5)===0||(((bj%5)+5)%5)===0) continue;
      var rr=Math.hypot(cx/(CW/2),cz/(CH/2)); if(rr>1) continue;
      if(minDist(cx,cz,riverPts)<1.3||minDist(cx,cz,hwPts)<1.0) continue;
      var inPark=false; for(var pk=0;pk<parks.length;pk++){ var P=parks[pk]; if(bi>=P[0]&&bi<=P[1]&&bj>=P[2]&&bj<=P[3]) inPark=true; }
      if(inPark){ parkCells.push([cx,cz]); continue; }
      var fall=1-Math.pow(rr,2.4);
      blds.push([cx,cz,(0.14+Math.pow(Math.random(),2.2)*0.8)*fall+0.02]);
    }}
    var boxG=new THREE.BoxGeometry(1,1,1); boxG.translate(0,0.5,0);
    var bMesh=new THREE.InstancedMesh(boxG,std(0xffffff),blds.length), dm=new THREE.Object3D(), cc=new THREE.Color();
    for(var n=0;n<blds.length;n++){
      dm.position.set(blds[n][0],0,blds[n][1]); dm.scale.set(0.86,blds[n][2],0.86); dm.updateMatrix();
      bMesh.setMatrixAt(n,dm.matrix);
      cc.setHex(0x9ea4af).lerp(new THREE.Color(0xc2c7d1),Math.random()); bMesh.setColorAt(n,cc);
    }
    city.add(bMesh);
    var pMesh=new THREE.InstancedMesh(boxG,std(0x8fc79a),parkCells.length);
    var tMesh=new THREE.InstancedMesh(new THREE.SphereGeometry(0.2,10,8),std(0x5fae74),parkCells.length*2);
    for(var q=0;q<parkCells.length;q++){
      dm.position.set(parkCells[q][0],0,parkCells[q][1]); dm.scale.set(0.98,0.04,0.98); dm.updateMatrix(); pMesh.setMatrixAt(q,dm.matrix);
      for(var tt=0;tt<2;tt++){ dm.position.set(parkCells[q][0]+(Math.random()-0.5)*0.6,0.2,parkCells[q][1]+(Math.random()-0.5)*0.6);
        var ts=0.7+Math.random()*0.6; dm.scale.set(ts,ts,ts); dm.updateMatrix(); tMesh.setMatrixAt(q*2+tt,dm.matrix); }
    }
    city.add(pMesh); city.add(tMesh);

    // delivery route along the street grid (rounded corners)
    function S(x,z){ return new THREE.Vector3(x+0.5,0.1,z+0.5); }
    var wps=[S(-15,5),S(-15,0),S(-5,0),S(-5,-5),S(5,-5),S(5,-10),S(10,-10)], rp=[wps[0].clone()];
    for(var w=1;w<wps.length-1;w++){
      var p0=wps[w-1],p1=wps[w],p2=wps[w+1], R=1.1;
      var a=p1.clone().add(p0.clone().sub(p1).normalize().multiplyScalar(R)), b=p1.clone().add(p2.clone().sub(p1).normalize().multiplyScalar(R));
      var bez=new THREE.QuadraticBezierCurve3(a,p1,b); for(var k2=0;k2<=10;k2++) rp.push(bez.getPoint(k2/10));
    }
    rp.push(wps[wps.length-1].clone());
    var rCurve=new THREE.CatmullRomCurve3(rp,false,'centripetal');
    var SEG=420, RAD=8;
    city.add(new THREE.Mesh(new THREE.TubeGeometry(rCurve,SEG,0.13,RAD,false),basic(0xA80000,{transparent:true,opacity:0.18,depthWrite:false})));
    var rDone=new THREE.Mesh(new THREE.TubeGeometry(rCurve,SEG,0.085,RAD,false),basic(0xA80000)); city.add(rDone);

    // pins
    function makePin(col){
      var g=new THREE.Group();
      var cone=new THREE.Mesh(new THREE.ConeGeometry(0.2,0.6,20),std(col,{roughness:0.35})); cone.rotation.x=Math.PI; cone.position.y=0.3; g.add(cone);
      var ball=new THREE.Mesh(new THREE.SphereGeometry(0.3,24,18),std(col,{roughness:0.35})); ball.position.y=0.78; g.add(ball);
      var dot=new THREE.Mesh(new THREE.SphereGeometry(0.11,16,12),basic(0xffffff)); dot.position.set(0,0.78,0.24); g.add(dot);
      var ring=new THREE.Mesh(new THREE.RingGeometry(0.28,0.4,40),basic(col,{transparent:true,opacity:0.5,side:THREE.DoubleSide,depthWrite:false}));
      ring.rotation.x=-Math.PI/2; ring.position.y=0.03; g.add(ring); g.userData.ring=ring; g.userData.ball=[cone,ball,dot];
      return g;
    }
    var pinA=makePin(0xA80000), pinB=makePin(0x1c1f26);
    pinA.position.copy(wps[0]); pinB.position.copy(wps[wps.length-1]); pinA.position.y=0; pinB.position.y=0;
    city.add(pinA); city.add(pinB);

    // rider (scooter + courier with delivery bag), forward = +z
    var rider=new THREE.Group();
    var rBody=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.2,0.9),std(0xA80000,{roughness:0.35})); rBody.position.y=0.3; rider.add(rBody);
    [0.42,-0.4].forEach(function(z){ var wh=new THREE.Mesh(new THREE.CylinderGeometry(0.17,0.17,0.12,20),std(0x15171b)); wh.rotation.z=Math.PI/2; wh.position.set(0,0.17,z); rider.add(wh); });
    var steer=new THREE.Mesh(new THREE.BoxGeometry(0.4,0.04,0.05),std(0x15171b)); steer.position.set(0,0.62,0.36); rider.add(steer);
    var fork=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.45,0.05),std(0x15171b)); fork.position.set(0,0.4,0.4); fork.rotation.x=-0.25; rider.add(fork);
    var torso=new THREE.Mesh(new THREE.BoxGeometry(0.26,0.4,0.2),std(0x1c1f26)); torso.position.set(0,0.66,-0.05); torso.rotation.x=0.2; rider.add(torso);
    var head=new THREE.Mesh(new THREE.SphereGeometry(0.15,16,12,0,Math.PI*2,0,Math.PI*0.6),std(0xA80000,{roughness:0.3})); head.position.set(0,0.98,0); rider.add(head);
    var headB=new THREE.Mesh(new THREE.SphereGeometry(0.12,14,10),std(0xe7c9a8)); headB.position.set(0,0.92,0.02); rider.add(headB);
    var rbag=new THREE.Mesh(new THREE.BoxGeometry(0.46,0.44,0.46),std(0xA80000,{roughness:0.5})); rbag.position.set(0,0.78,-0.4); rider.add(rbag);
    rider.scale.setScalar(1.15); city.add(rider);

    // labels
    var labelRedraws=[];
    function label(txt,bg,fg,w){
      var c=document.createElement('canvas'); c.width=512; c.height=128; var g=c.getContext('2d');
      var t=new THREE.CanvasTexture(c); t.encoding=THREE.sRGBEncoding;
      function draw(){ g.clearRect(0,0,512,128); g.fillStyle=bg; var x=6,y=10,ww=500,hh=108,r=54;
        g.beginPath(); g.moveTo(x+r,y); g.lineTo(x+ww-r,y); g.arc(x+ww-r,y+r,r,-Math.PI/2,Math.PI/2); g.lineTo(x+r,y+hh); g.arc(x+r,y+r,r,Math.PI/2,Math.PI*1.5); g.closePath(); g.fill();
        g.fillStyle=fg; g.font='700 54px "Plus Jakarta Sans",Inter,Arial,sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText(txt,256,67); t.needsUpdate=true; }
      draw(); labelRedraws.push(draw);
      var sp=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true,fog:false,depthWrite:false,toneMapped:false}));
      sp.scale.set(w,w/4,1); return sp;
    }
    if(document.fonts&&document.fonts.ready) document.fonts.ready.then(function(){ labelRedraws.forEach(function(f){ f(); }); });
    var lblA=label('Pick up','#A80000','#ffffff',4.6); lblA.position.copy(wps[0]); lblA.position.y=2.1; city.add(lblA);
    var lblB=label('Drop off','#1c1f26','#ffffff',4.6); lblB.position.copy(wps[wps.length-1]); lblB.position.y=2.1; city.add(lblB);
    var lblE=label('+$8.50','#e8f7ee','#0a8a3d',4.2); lblE.position.copy(wps[wps.length-1]); lblE.position.y=3.1; lblE.material.opacity=0; city.add(lblE);
    var lblS=label('1.2x busy','#1d4ed8','#ffffff',4.4); lblS.position.set(0.5,1.6,-1.5); city.add(lblS);

    // mode switch
    var showGear=(MODE!=='route');
    [helmet,lock,bag,shHelmet,shLock,shBag].forEach(function(o){ o.visible=showGear; });
    if(MODE==='route'){ route.visible=false; dots.forEach(function(d){ d.m.visible=false; }); }
    city.visible=(MODE!=='gear');
    if(MODE==='gear') scene.fog=null;

    // ---------- Layout ----------
    var base={helmet:new THREE.Vector3(),lock:new THREE.Vector3(),bag:new THREE.Vector3()}, unit=1, narrow=false;
    function layout(){
      var w=hero.clientWidth, h=hero.clientHeight;
      renderer.setSize(w,h,false);
      camera.aspect=w/h; camera.updateProjectionMatrix();
      var halfH=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.position.z;
      var halfW=halfH*camera.aspect;
      narrow=w<900;
      unit=Math.min(1,halfW/7.2);
      var sc=narrow?unit*1.1:unit; curSc=sc;
      var cs=narrow?Math.max(halfW*2.0/28,halfH*0.9/(CH*0.62)):halfW*2.3/CW;
      city.scale.setScalar(cs); city.position.set(0,-halfH*(narrow?0.05:0.18),-3);
      helmet.scale.setScalar(sc*0.95); lock.scale.setScalar(sc*0.95); bag.scale.setScalar(sc*0.85);
      if(narrow){
        base.helmet.set(-halfW*0.78,halfH*0.80,-1);
        base.lock.set(halfW*0.80,halfH*0.20,-2);
        base.bag.set(-halfW*0.80,-halfH*0.55,-2);
        canvas.style.opacity='0.5';
      }else{
        base.helmet.set(-halfW*0.80,halfH*0.28,0);
        base.lock.set(halfW*0.82,halfH*0.42,0);
        base.bag.set(halfW*0.72,-halfH*0.46,0.5);
        canvas.style.opacity='1';
      }
    }
    layout();
    if(window.ResizeObserver) new ResizeObserver(layout).observe(hero); else window.addEventListener('resize',layout);

    // ---------- Interaction ----------
    var mx=0,my=0,tx=0,ty=0;
    window.addEventListener('pointermove',function(e){
      var r=hero.getBoundingClientRect();
      tx=((e.clientX-r.left)/r.width-0.5)*2; ty=((e.clientY-r.top)/r.height-0.5)*2;
    },{passive:true});
    var scrollY=0;
    window.addEventListener('scroll',function(){ scrollY=Math.max(0,Math.min(1,window.scrollY/Math.max(1,hero.clientHeight))); },{passive:true});

    // ---------- Loop ----------
    var visible=true, clock=new THREE.Clock(), time=0;
    if('IntersectionObserver' in window) new IntersectionObserver(function(en){ visible=en[0].isIntersecting; },{threshold:0}).observe(hero);

    function frame(){
      requestAnimationFrame(frame);
      if(!visible) return;
      var dt=Math.min(clock.getDelta(),0.05); if(!reduce) time+=dt;
      mx+=(tx-mx)*0.06; my+=(ty-my)*0.06;

      helmet.position.set(base.helmet.x+mx*0.35, base.helmet.y-my*0.25+Math.sin(time*0.9)*0.18-scrollY*1.2, base.helmet.z);
      helmet.rotation.y=0.5+Math.sin(time*0.5)*0.35+mx*0.6;
      helmet.rotation.x=0.15-my*0.3;

      lock.position.set(base.lock.x+mx*0.25, base.lock.y-my*0.2+Math.sin(time*1.1+1.5)*0.2-scrollY*0.9, base.lock.z);
      lock.rotation.y=-0.5+time*0.45+mx*0.4;
      lock.rotation.z=0.25+Math.sin(time*0.7)*0.1;

      bag.position.set(base.bag.x+mx*0.5, base.bag.y-my*0.3+Math.sin(time*0.8+3)*0.22-scrollY*0.6, base.bag.z);
      bag.rotation.y=0.6-time*0.35+mx*0.3;
      bag.rotation.x=0.35+Math.sin(time*0.6)*0.12;

      placeShadow(shHelmet,helmet,2.1,3.2); placeShadow(shLock,lock,2.2,2.6); placeShadow(shBag,bag,1.7,2.6);
      dots.forEach(function(o){
        var u=(time*0.06+o.off)%1;
        o.m.position.copy(curve.getPoint(u));
        var s=1+Math.sin(time*4+o.off*6)*0.15; o.m.children[0].scale.setScalar(s);
      });
      route.position.x=mx*-0.4; route.position.y=my*0.2;

      var a=particles.geometry.attributes.position.array;
      for(var i=0;i<N;i++){ a[i*3+1]+=Math.sin(time*0.6+seeds[i])*0.002; }
      particles.geometry.attributes.position.needsUpdate=true;
      particles.rotation.y=mx*0.08;

      if(city.visible){
        city.rotation.set(0.92-my*0.05,-0.38+Math.sin(time*0.15)*0.05+mx*0.1,0);
        var pr=reduce?0.6:Math.min(1,(time*0.045)%1.2);
        var rpos=rCurve.getPointAt(pr), rtan=rCurve.getTangentAt(pr);
        rider.position.set(rpos.x,0.02,rpos.z); rider.rotation.y=Math.atan2(rtan.x,rtan.z);
        rider.position.y=0.02+Math.abs(Math.sin(time*9))*0.012;
        rDone.geometry.setDrawRange(0,Math.floor(pr*SEG)*RAD*6);
        var arrived=pr>=0.995;
        lblE.material.opacity+=((arrived?1:0)-lblE.material.opacity)*0.12;
        lblE.position.y=3.1+(arrived?Math.sin(time*3)*0.12:0);
        [[pinA,0],[pinB,1]].forEach(function(o){ var pn=o[0], ph=(time*0.9+o[1]*0.5)%1;
          pn.userData.ring.scale.setScalar(1+ph*2.2); pn.userData.ring.material.opacity=0.5*(1-ph);
          pn.position.y=Math.abs(Math.sin(time*2+o[1]))*0.05; });
        lblS.position.y=1.6+Math.sin(time*1.3)*0.1;
      }
      camera.position.x=mx*0.4; camera.position.y=-my*0.25; camera.lookAt(0,0,0);
      renderer.render(scene,camera);
    }
    frame();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
