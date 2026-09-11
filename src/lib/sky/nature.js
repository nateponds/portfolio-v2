import * as THREE from 'three';

let seed = 49013;
function random() { seed = (Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; }
const sphere = new THREE.SphereGeometry(1,24,16);

function surface(kind) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = kind==='bark' ? '#776957' : '#d6c7af';
  ctx.fillRect(0,0,256,256);
  for(let i=0;i<2400;i++) {
    const x=random()*256, y=random()*256;
    ctx.strokeStyle = `rgba(${random()>.5?'255,239,207':'42,30,24'},${random()*.25})`;
    ctx.lineWidth = random()*(kind==='bark'?2:.7)+.2;
    ctx.beginPath(); ctx.moveTo(x,y);
    ctx.lineTo(x+(kind==='bark'?random()*5:random()*14-7),y+random()*(kind==='bark'?90:16)); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function ellipsoid(parent,material,position,scale) {
  const mesh = new THREE.Mesh(sphere,material);
  mesh.position.set(...position); mesh.scale.set(...scale); parent.add(mesh);
  return mesh;
}


function taperedBranch(points,radius,material) {
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const geometry=new THREE.TubeGeometry(curve,32,radius,9,false);
  const positions=geometry.attributes.position;
  for(let i=0;i<=32;i++) {
    const center=curve.getPointAt(i/32),taper=1-.87*(i/32);
    for(let j=0;j<=9;j++) {
      const k=i*10+j;
      positions.setXYZ(k,center.x+(positions.getX(k)-center.x)*taper,center.y+(positions.getY(k)-center.y)*taper,center.z+(positions.getZ(k)-center.z)*taper);
    }
  }
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry,material);
}

export function createBranch() {
  const root=new THREE.Group(), sway=new THREE.Group();root.add(sway);
  const barkTexture=surface('bark');
  barkTexture.repeat.set(2,5);
  const bark=new THREE.MeshStandardMaterial({color:'#746957',map:barkTexture,bumpMap:barkTexture,bumpScale:.035,roughness:1});
  const bud=new THREE.MeshStandardMaterial({color:'#656044',roughness:1});
  sway.add(taperedBranch([[3,-2.6,1.6],[1.6,-.9,.6],[.5,.23,.1],[-.8,.62,0],[-2.6,.97,-.3]],.135,bark));
  const twigs=[];
  for(const spec of [
    [[1.3,-.6,.5],[1.55,.5,.7],[1.28,1.7,.85],[1.55,2.1,.8]],
    [[.3,.3,.1],[-.05,1.13,.05],[-.48,1.83,-.2],[-.25,2.18,-.2]],
    [[-.85,.65,0],[-1.7,.1,.3],[-2.55,.22,.3]],
    [[2,-1.4,1.],[.3,-1.1,2.2],[-1.2,-.42,3.3],[-2.1,.2,3.8]],
    [[2,-1.3,1.],[2.9,.0,2.7],[3.2,1.7,3.5]],
  ]) {
    const pivot=new THREE.Group();pivot.position.set(...spec[0]);sway.add(pivot);
    const local=spec.map(p=>p.map((v,i)=>v-spec[0][i]));
    pivot.add(taperedBranch(local,.042,bark)); twigs.push(pivot);
    for(let i=1;i<local.length;i++) {
      const p=local[i];
      pivot.add(taperedBranch([p,[p[0]-.22,p[1]+.18,p[2]],[p[0]-.39,p[1]+.42,p[2]+.05]],.012,bark));
      ellipsoid(pivot,bud,[p[0]-.38,p[1]+.41,p[2]+.05],[.031,.071,.029]).rotation.z=-.4;
    }
  }
  const near=new THREE.Group();
  near.add(taperedBranch([[1.5,-1.8,0],[.3,-.3,.4],[-.7,.7,.7],[-.9,1.9,1.1]],.12,bark));
  near.add(taperedBranch([[.3,-.3,.4],[.45,.7,.9],[.1,1.5,1.3]],.075,bark));
  near.add(taperedBranch([[-.7,.7,.7],[-1.5,1.1,1.2],[-1.9,1.8,1.5]],.045,bark));
  const perch=new THREE.Object3D();perch.position.set(-.93,.69,0);sway.add(perch);
  return {root,sway,perch,near,
    update(time,impact=0) {
      sway.rotation.z=Math.sin(time*.67)*.012+Math.sin(time*1.13+.7)*.006+impact;
      sway.rotation.y=Math.sin(time*.41)*.013;
      near.rotation.z=Math.sin(time*.56+.8)*.032;
      near.rotation.y=Math.sin(time*.77)*.022;
      twigs.forEach((twig,i)=>{twig.rotation.z=Math.sin(time*(.85+i*.12)+i)*.018;});
    },
  };
}

export function createMoon(map) {
  const material=new THREE.ShaderMaterial({
    uniforms:{map:{value:map},daylight:{value:1}},transparent:true,depthWrite:false,
    vertexShader:`varying vec3 vN;
      void main(){vN=normalize(normalMatrix*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader:`uniform sampler2D map; uniform float daylight; varying vec3 vN;
      void main(){
        vec3 n=normalize(vN);
        float phase=smoothstep(-.24,.5,dot(n,normalize(vec3(-.75,.55,.3))));
        float limb=smoothstep(0.,.50,n.z);
        // Project the existing lunar photograph onto the visible hemisphere.
        vec3 surface=texture2D(map,n.xy*.485+.5).rgb;
        vec3 color=mix(vec3(.84,.9,1.),vec3(.86,.89,.94),daylight)*surface*(.65+phase*.65);
        float alpha=limb*phase*mix(.85,.38,daylight);
        gl_FragColor=vec4(color,alpha);
      }`,
  });
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(1,64,48),material);
  mesh.visible=!!map;
  return mesh;
}
