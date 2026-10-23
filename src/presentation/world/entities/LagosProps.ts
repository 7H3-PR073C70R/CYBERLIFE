import * as THREE from 'three';
import { AABB } from '../CollisionWorld';

export interface LagosPropResult {
  mesh: THREE.Group;
  aabb?: AABB;
}

/**
 * Procedural prop generators for authentic Lagos Island urban details:
 * - Danfo commercial minibus (yellow with twin black racing stripes)
 * - Market stalls with striped canvas awnings & display crates
 * - Concrete utility poles with cross-arms and transformers
 * - Official Lagos State green & white street name signposts
 * - Tropical royal palm trees
 * - Marina seawall with safety railings and mooring bollards
 * - Tinubu Square central monument & fountain
 * - Rooftop black polyethylene water storage tanks
 */
export class LagosProps {
  /**
   * Builds the iconic Lagos Danfo commercial minibus:
   * Recognizable yellow body (#facc15), twin black horizontal stripes,
   * passenger windows, wheels/tires, headlights, and front grille.
   */
  public static createDanfoMinibus(
    x: number,
    z: number,
    rotationY = 0,
    options: { withDoorCutout?: boolean; withConductorStep?: boolean } = {}
  ): LagosPropResult {
    const group = new THREE.Group();
    group.name = 'DanfoMinibus';
    group.position.set(x, 0, z);
    group.rotation.y = rotationY;

    const withCutout = options.withDoorCutout !== false; // Default true

    // Dimensions: Length: 4.8m, Width: 2.1m, Height: 2.15m
    const bodyW = 2.1;
    const bodyH = 1.25;
    const bodyL = 4.8;
    const chassisY = 0.42;

    // Materials
    const yellowMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Authentic Lagos Transit Yellow
      roughness: 0.32,
      metalness: 0.18,
    });
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x09090b }); // Jet black livery stripe
    const roofMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Ivory white roof panel
      roughness: 0.28,
      metalness: 0.1,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep tinted safety glass
      roughness: 0.08,
      metalness: 0.92,
      transparent: true,
      opacity: 0.88,
    });
    const darkMetalMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
      metalness: 0.7,
    });
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.15,
      metalness: 0.95,
    });
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.85,
      metalness: 0.05,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.8,
    });

    // 1. Chassis Floor Base & Rubber Matting (Hollow cabin interior)
    const floorGeo = new THREE.BoxGeometry(bodyW - 0.12, 0.08, bodyL - 0.2);
    const floor = new THREE.Mesh(floorGeo, darkMetalMat);
    floor.position.set(0, chassisY + 0.04, 0);
    floor.receiveShadow = true;
    group.add(floor);

    // Ribbed floor matting (dark charcoal transit rubber)
    const matGeo = new THREE.BoxGeometry(bodyW - 0.25, 0.02, bodyL - 0.6);
    const matMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.95 });
    const rubberMat = new THREE.Mesh(matGeo, matMat);
    rubberMat.position.set(0, chassisY + 0.09, -0.1);
    group.add(rubberMat);

    // 2. Driver Flank (+X: Driver Side) - Continuous lower body wall, upper cabin wall & windows
    const driverWallGeo = new THREE.BoxGeometry(0.12, bodyH, bodyL - 0.3);
    const driverWall = new THREE.Mesh(driverWallGeo, yellowMat);
    driverWall.position.set(bodyW / 2 - 0.06, chassisY + bodyH / 2, -0.05);
    driverWall.castShadow = true;
    group.add(driverWall);

    const driverUpperWallGeo = new THREE.BoxGeometry(0.12, 0.72, bodyL - 0.3);
    const driverUpperWall = new THREE.Mesh(driverUpperWallGeo, yellowMat);
    driverUpperWall.position.set(bodyW / 2 - 0.06, chassisY + bodyH + 0.36, -0.05);
    driverUpperWall.castShadow = true;
    group.add(driverUpperWall);

    // Driver side panoramic tinted windows
    const driverWinGeo = new THREE.BoxGeometry(0.04, 0.55, bodyL - 0.6);
    const driverWin = new THREE.Mesh(driverWinGeo, glassMat);
    driverWin.position.set(bodyW / 2 + 0.01, chassisY + bodyH + 0.36, -0.1);
    group.add(driverWin);

    // 3. Rear Flank (-Z) - Lower tailgate & upper rear window
    const rearLowerGeo = new THREE.BoxGeometry(bodyW, bodyH, 0.12);
    const rearLower = new THREE.Mesh(rearLowerGeo, yellowMat);
    rearLower.position.set(0, chassisY + bodyH / 2, -bodyL / 2 + 0.06);
    rearLower.castShadow = true;
    group.add(rearLower);

    const rearUpperGeo = new THREE.BoxGeometry(bodyW, 0.72, 0.12);
    const rearUpper = new THREE.Mesh(rearUpperGeo, yellowMat);
    rearUpper.position.set(0, chassisY + bodyH + 0.36, -bodyL / 2 + 0.06);
    rearUpper.castShadow = true;
    group.add(rearUpper);

    // 4. Front Cowl (+Z) - Front cab nose & fascia
    const frontLowerGeo = new THREE.BoxGeometry(bodyW, bodyH, 0.55);
    const frontLower = new THREE.Mesh(frontLowerGeo, yellowMat);
    frontLower.position.set(0, chassisY + bodyH / 2, bodyL / 2 - 0.275);
    frontLower.castShadow = true;
    group.add(frontLower);

    // Front rounded aerodynamic nose cowl
    const noseGeo = new THREE.CylinderGeometry(0.55, 0.55, bodyW, 16);
    const nose = new THREE.Mesh(noseGeo, yellowMat);
    nose.rotation.z = Math.PI / 2;
    nose.position.set(0, chassisY + 0.55, bodyL / 2 - 0.1);
    group.add(nose);

    // 5. Cabin Interior: Commuter Bench Seats, Driver & Front Passenger Bucket Seats
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7 });
    [-0.3, -1.1, -1.8].forEach(sz => {
      const bench = new THREE.Mesh(new THREE.BoxGeometry(bodyW - 0.5, 0.42, 0.36), seatMat);
      bench.position.set(0.12, chassisY + 0.34, sz);
      bench.castShadow = true;
      group.add(bench);
    });

    // Front Driver & Front Passenger Bucket Seats
    [-0.55, 0.55].forEach(sx => {
      const fSeat = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.62, 0.44), seatMat);
      fSeat.position.set(sx, chassisY + 0.44, 1.45);
      fSeat.castShadow = true;
      group.add(fSeat);
    });

    // Dashboard & Steering Wheel
    const dash = new THREE.Mesh(new THREE.BoxGeometry(bodyW - 0.3, 0.35, 0.5), darkMetalMat);
    dash.position.set(0, chassisY + 0.7, 1.85);
    group.add(dash);

    const steeringWheel = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.025, 8, 16), darkMetalMat);
    steeringWheel.position.set(-0.55, chassisY + 0.88, 1.62);
    steeringWheel.rotation.x = Math.PI / 4;
    group.add(steeringWheel);

    // Seated Driver Figure (authentic Nigerian driver with cap and uniform)
    const driverGroup = new THREE.Group();
    driverGroup.position.set(-0.55, chassisY + 0.36, 1.45);
    const driverSkinMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.8 });
    const driverShirtMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.7 });
    const driverCapMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });

    const driverTorso = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.44, 0.26), driverShirtMat);
    driverTorso.position.y = 0.42;
    const driverHead = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 8), driverSkinMat);
    driverHead.position.y = 0.72;
    const driverCap = new THREE.Mesh(new THREE.SphereGeometry(0.115, 8, 8), driverCapMat);
    driverCap.position.set(0, 0.75, 0.03);
    // Arms reaching towards steering wheel
    const armGeo = new THREE.BoxGeometry(0.08, 0.1, 0.32);
    const armL = new THREE.Mesh(armGeo, driverShirtMat);
    armL.position.set(-0.16, 0.42, 0.16);
    const armR = new THREE.Mesh(armGeo, driverShirtMat);
    armR.position.set(0.16, 0.42, 0.16);
    driverGroup.add(driverTorso, driverHead, driverCap, armL, armR);
    group.add(driverGroup);

    // Seated Commuter Passengers (visible through windows and open sliding door)
    const createSeatedPassenger = (xPos: number, zPos: number, skinColor: number, shirtColor: number) => {
      const pGroup = new THREE.Group();
      pGroup.position.set(xPos, chassisY + 0.32, zPos);
      const skinM = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.8 });
      const shirtM = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.7 });
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.42, 0.24), shirtM);
      torso.position.y = 0.38;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.10, 8, 8), skinM);
      head.position.y = 0.66;
      pGroup.add(torso, head);
      return pGroup;
    };

    // Commuters inside on bench rows
    group.add(createSeatedPassenger(0.42, -0.3, 0x523220, 0xd97706)); // Row 1 window: bronze skin, orange Ankara
    group.add(createSeatedPassenger(0.40, -1.1, 0x3a2012, 0xf8fafc)); // Row 2 window: dark mahogany skin, white shirt
    group.add(createSeatedPassenger(-0.25, -1.8, 0x4a2818, 0x0d9488)); // Row 3: warm brown skin, teal top

    // 6. Passenger Flank (-X: Curb / Sliding Door Side)
    if (withCutout) {
      // Cab Section: front lower door panel and upper window (z = 0.75 to 2.125)
      const cabL = 1.375;
      const cabDoorZ = 0.75 + cabL / 2; // 1.4375
      const cabLower = new THREE.Mesh(new THREE.BoxGeometry(0.12, bodyH, cabL), yellowMat);
      cabLower.position.set(-bodyW / 2 + 0.06, chassisY + bodyH / 2, cabDoorZ);
      cabLower.castShadow = true;
      group.add(cabLower);

      const cabUpper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.72, cabL), yellowMat);
      cabUpper.position.set(-bodyW / 2 + 0.06, chassisY + bodyH + 0.36, cabDoorZ);
      cabUpper.castShadow = true;
      group.add(cabUpper);

      const cabWin = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.52, cabL - 0.3), glassMat);
      cabWin.position.set(-bodyW / 2 - 0.01, chassisY + bodyH + 0.36, cabDoorZ);
      group.add(cabWin);

      // Rear Quarter Section: behind sliding door (z = -2.34 to -0.75)
      const rearL = 1.59;
      const rearZ = -0.75 - rearL / 2; // -1.545
      const rearQuarterLower = new THREE.Mesh(new THREE.BoxGeometry(0.12, bodyH, rearL), yellowMat);
      rearQuarterLower.position.set(-bodyW / 2 + 0.06, chassisY + bodyH / 2, rearZ);
      rearQuarterLower.castShadow = true;
      group.add(rearQuarterLower);

      const rearQuarterUpper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.72, rearL), yellowMat);
      rearQuarterUpper.position.set(-bodyW / 2 + 0.06, chassisY + bodyH + 0.36, rearZ);
      rearQuarterUpper.castShadow = true;
      group.add(rearQuarterUpper);

      const rearWin2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.52, rearL - 0.3), glassMat);
      rearWin2.position.set(-bodyW / 2 - 0.01, chassisY + bodyH + 0.36, rearZ);
      group.add(rearWin2);

      // --- THE AUTHENTIC OPEN SLIDING DOORWAY CUTOUT ("danfo should have a cut where the condor his") ---
      // Spans z = -0.75 to +0.75 (1.50m wide, completely OPEN down to the runner step / floor!)
      const doorwayW = 1.50;

      // Top Door Lintel Frame
      const topLintel = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.16, doorwayW), yellowMat);
      topLintel.position.set(-bodyW / 2 + 0.06, chassisY + bodyH + 0.64, 0.0);
      group.add(topLintel);

      // Open Sliding Door Panel: parked slid back alongside the rear quarter panel!
      const slidDoor = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, bodyH + 0.60, doorwayW - 0.05),
        yellowMat
      );
      slidDoor.position.set(-bodyW / 2 - 0.06, chassisY + (bodyH + 0.60) / 2 + 0.02, rearZ);
      slidDoor.castShadow = true;
      group.add(slidDoor);

      // Window on the slid door panel
      const slidWin = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.52, doorwayW - 0.35), glassMat);
      slidWin.position.set(-bodyW / 2 - 0.1, chassisY + bodyH + 0.36, rearZ);
      group.add(slidWin);

      // Chrome handle on slid door
      const doorHandle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.06, 0.16), chromeMat);
      doorHandle.position.set(-bodyW / 2 - 0.11, chassisY + 0.85, rearZ + (doorwayW / 2) - 0.2);
      group.add(doorHandle);

      // Metal Runner Step / Footboard: extended threshold where conductor stands and commuters step
      const stepGeo = new THREE.BoxGeometry(0.26, 0.06, doorwayW + 0.1);
      const runnerStep = new THREE.Mesh(stepGeo, darkMetalMat);
      runnerStep.position.set(-bodyW / 2 - 0.08, chassisY + 0.04, 0.0);
      runnerStep.castShadow = true;
      runnerStep.receiveShadow = true;
      group.add(runnerStep);

      // Overhead Tubular Steel Grab Rail: along top of doorway opening
      const grabRailGeo = new THREE.CylinderGeometry(0.025, 0.025, doorwayW, 8);
      const grabRail = new THREE.Mesh(grabRailGeo, darkMetalMat);
      grabRail.rotation.x = Math.PI / 2;
      grabRail.position.set(-bodyW / 2 + 0.02, chassisY + bodyH + 0.54, 0.0);
      group.add(grabRail);

      // Vertical Safety Grab Pole: inside front edge of the doorway
      const vertPoleGeo = new THREE.CylinderGeometry(0.022, 0.022, bodyH + 0.62, 8);
      const vertPole = new THREE.Mesh(vertPoleGeo, chromeMat);
      vertPole.position.set(-bodyW / 2 + 0.16, chassisY + (bodyH + 0.62) / 2 + 0.02, 0.68);
      group.add(vertPole);

      // Livery stripes on -X side ONLY on cab and rear quarter (leaving door cutout clear!)
      [-0.05, 0.15].forEach(dy => {
        // Cab stripe
        const sCab = new THREE.Mesh(new THREE.PlaneGeometry(cabL, 0.09), stripeMat);
        sCab.position.set(-bodyW / 2 - 0.005, chassisY + 0.78 + dy, cabDoorZ);
        sCab.rotation.y = -Math.PI / 2;
        group.add(sCab);

        // Rear quarter stripe
        const sRear = new THREE.Mesh(new THREE.PlaneGeometry(rearL, 0.09), stripeMat);
        sRear.position.set(-bodyW / 2 - 0.005, chassisY + 0.78 + dy, rearZ);
        sRear.rotation.y = -Math.PI / 2;
        group.add(sRear);

        // Slid door exterior stripe
        const sSlid = new THREE.Mesh(new THREE.PlaneGeometry(doorwayW - 0.05, 0.09), stripeMat);
        sSlid.position.set(-bodyW / 2 - 0.095, chassisY + 0.78 + dy, rearZ);
        sSlid.rotation.y = -Math.PI / 2;
        group.add(sSlid);
      });
    } else {
      // Solid closed flank if cutout not requested
      const rCabinLower = new THREE.Mesh(new THREE.BoxGeometry(0.12, bodyH, bodyL - 0.3), yellowMat);
      rCabinLower.position.set(-bodyW / 2 + 0.06, chassisY + bodyH / 2, -0.05);
      group.add(rCabinLower);

      const rCabinUpper = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.72, bodyL - 0.3), yellowMat);
      rCabinUpper.position.set(-bodyW / 2 + 0.06, chassisY + bodyH + 0.36, -0.05);
      group.add(rCabinUpper);

      [-0.05, 0.15].forEach(dy => {
        const sR = new THREE.Mesh(new THREE.PlaneGeometry(bodyL * 0.94, 0.09), stripeMat);
        sR.position.set(-bodyW / 2 - 0.005, chassisY + 0.78 + dy, 0);
        sR.rotation.y = -Math.PI / 2;
        group.add(sR);
      });
    }

    // 7. Twin Black Horizontal Stripes on Left Side (+X) and Rear (-Z)
    const stripeGeo = new THREE.PlaneGeometry(bodyL * 0.94, 0.09);
    // Left side (+X)
    [-0.05, 0.15].forEach(dy => {
      const sL = new THREE.Mesh(stripeGeo, stripeMat);
      sL.position.set(bodyW / 2 + 0.005, chassisY + 0.78 + dy, 0);
      sL.rotation.y = Math.PI / 2;
      group.add(sL);
    });

    // Rear stripes (-Z)
    const rearStripeGeo = new THREE.PlaneGeometry(bodyW * 0.9, 0.09);
    [-0.05, 0.15].forEach(dy => {
      const sRear = new THREE.Mesh(rearStripeGeo, stripeMat);
      sRear.position.set(0, chassisY + 0.78 + dy, -bodyL / 2 - 0.005);
      sRear.rotation.y = Math.PI;
      group.add(sRear);
    });

    // 6. Contoured Ivory / White Roof Panel with Strengthening Ribs
    const roofH = 0.22;
    const roofGeo = new THREE.BoxGeometry(bodyW + 0.04, roofH, bodyL - 0.15);
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.set(0, chassisY + bodyH + 0.72 + roofH / 2, -0.05);
    roof.castShadow = true;
    group.add(roof);

    // Roof Strengthening Ribs (3 longitudinal ribs on roof)
    [-0.5, 0, 0.5].forEach(rx => {
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, bodyL - 0.6), roofMat);
      rib.position.set(rx, chassisY + bodyH + 0.72 + roofH + 0.02, -0.05);
      group.add(rib);
    });

    // 7. Windshield & Front Fascia
    const windshieldGeo = new THREE.BoxGeometry(bodyW - 0.22, 0.65, 0.08);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, chassisY + bodyH + 0.32, bodyL / 2 - 0.22);
    windshield.rotation.x = -0.22;
    group.add(windshield);

    // Wiper blades
    [-0.35, 0.35].forEach(wx => {
      const wiper = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.03, 0.02), darkMetalMat);
      wiper.position.set(wx, chassisY + bodyH + 0.06, bodyL / 2 - 0.14);
      wiper.rotation.z = -0.3;
      group.add(wiper);
    });

    // Front Radiator Grille & Transit Emblem
    const grille = new THREE.Mesh(new THREE.BoxGeometry(bodyW - 0.6, 0.26, 0.08), darkMetalMat);
    grille.position.set(0, chassisY + 0.48, bodyL / 2 + 0.02);
    group.add(grille);

    const emblem = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 16), chromeMat);
    emblem.rotation.x = Math.PI / 2;
    emblem.position.set(0, chassisY + 0.48, bodyL / 2 + 0.07);
    group.add(emblem);

    // Dual Round Headlights with Chrome Bezels
    [-0.72, 0.72].forEach(hx => {
      const bezel = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.06, 16), chromeMat);
      bezel.rotation.x = Math.PI / 2;
      bezel.position.set(hx, chassisY + 0.48, bodyL / 2 + 0.03);
      group.add(bezel);

      const bulb = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.07, 16),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      bulb.rotation.x = Math.PI / 2;
      bulb.position.set(hx, chassisY + 0.48, bodyL / 2 + 0.05);
      group.add(bulb);

      // Amber turn indicator
      const ind = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.12, 0.04),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      );
      ind.position.set(hx + (hx > 0 ? 0.22 : -0.22), chassisY + 0.48, bodyL / 2 + 0.02);
      group.add(ind);
    });

    // Front Bumper with License Plate
    const fBumper = new THREE.Mesh(new THREE.BoxGeometry(bodyW + 0.08, 0.22, 0.2), darkMetalMat);
    fBumper.position.set(0, chassisY + 0.15, bodyL / 2 + 0.08);
    fBumper.castShadow = true;
    group.add(fBumper);

    // Lagos Commercial License Plate: Yellow / Blue text
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.13, 0.02),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 })
    );
    plate.position.set(0, chassisY + 0.15, bodyL / 2 + 0.19);
    group.add(plate);

    // 8. Rear Hatch & Taillight Clusters
    const rearWin = new THREE.Mesh(new THREE.BoxGeometry(bodyW - 0.4, 0.52, 0.08), glassMat);
    rearWin.position.set(0, chassisY + bodyH + 0.35, -bodyL / 2 + 0.06);
    group.add(rearWin);

    const rBumper = new THREE.Mesh(new THREE.BoxGeometry(bodyW + 0.08, 0.22, 0.2), darkMetalMat);
    rBumper.position.set(0, chassisY + 0.15, -bodyL / 2 - 0.08);
    group.add(rBumper);

    // Vertical Taillight Clusters (Red brake, Amber blinker, White reverse)
    [-bodyW / 2 + 0.18, bodyW / 2 - 0.18].forEach(tx => {
      const tlHousing = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.42, 0.05), darkMetalMat);
      tlHousing.position.set(tx, chassisY + 0.65, -bodyL / 2 - 0.02);
      group.add(tlHousing);

      // Red brake light
      const redLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.14, 0.06),
        new THREE.MeshStandardMaterial({
          color: 0xdc2626,
          emissive: new THREE.Color(0x991b1b),
          emissiveIntensity: 0.6,
        })
      );
      redLight.position.set(tx, chassisY + 0.74, -bodyL / 2 - 0.03);
      group.add(redLight);

      // Amber turn light
      const amberLight = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.1, 0.06),
        new THREE.MeshBasicMaterial({ color: 0xf59e0b })
      );
      amberLight.position.set(tx, chassisY + 0.61, -bodyL / 2 - 0.03);
      group.add(amberLight);
    });

    // 9. Side Mirrors
    [
      { x: bodyW / 2 + 0.12, rot: 0.15 },
      { x: -bodyW / 2 - 0.12, rot: -0.15 },
    ].forEach(m => {
      const mirrorArm = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.18, 6), darkMetalMat);
      mirrorArm.rotation.z = Math.PI / 2;
      mirrorArm.position.set(m.x > 0 ? bodyW / 2 + 0.06 : -bodyW / 2 - 0.06, chassisY + bodyH + 0.15, 1.6);
      group.add(mirrorArm);

      const mirrorHousing = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.14), darkMetalMat);
      mirrorHousing.position.set(m.x, chassisY + bodyH + 0.15, 1.6);
      mirrorHousing.rotation.y = m.rot;
      group.add(mirrorHousing);
    });

    // 10. Wheels (4 Realistic 3D Wheels with Rubber Tires & Steel Transit Rims)
    const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 18);
    const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.3, 16);
    const capGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.32, 12);

    const wheelCoords: [number, number][] = [
      [bodyW / 2 - 0.04, 1.35],
      [-bodyW / 2 + 0.04, 1.35],
      [bodyW / 2 - 0.04, -1.35],
      [-bodyW / 2 + 0.04, -1.35],
    ];

    wheelCoords.forEach(([wx, wz]) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(wx, 0.38, wz);
      wheelGroup.rotation.z = Math.PI / 2;

      const tire = new THREE.Mesh(tireGeo, tireMat);
      tire.castShadow = true;
      const rim = new THREE.Mesh(rimGeo, rimMat);
      const cap = new THREE.Mesh(capGeo, chromeMat);

      wheelGroup.add(tire, rim, cap);
      group.add(wheelGroup);
    });

    // Collision Bounding Box (accounting for rotation)
    const halfW = (rotationY !== 0 ? bodyL : bodyW) / 2;
    const halfL = (rotationY !== 0 ? bodyW : bodyL) / 2;
    const aabb: AABB = {
      minX: x - halfW,
      maxX: x + halfW,
      minZ: z - halfL,
      maxZ: z + halfL,
      label: 'Vehicle: Lagos Danfo Van',
    };

    return { mesh: group, aabb };
  }

  /**
   * Builds an authentic Balogun market stall with wooden frame,
   * striped awning canopy, and stacked display goods/crates.
   */
  public static createMarketStall(
    x: number,
    z: number,
    rotationY = 0,
    awningColor1 = 0xd97706,
    awningColor2 = 0xfef3c7,
    name = 'Balogun Market Stall'
  ): LagosPropResult {
    const group = new THREE.Group();
    group.name = `MarketStall_${name}`;
    group.position.set(x, 0, z);
    group.rotation.y = rotationY;

    const stallW = 2.8;
    const stallD = 2.0;
    const tableH = 0.9;

    // 1. Wooden Table Counter
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const topGeo = new THREE.BoxGeometry(stallW, 0.12, stallD);
    const tableTop = new THREE.Mesh(topGeo, woodMat);
    tableTop.position.y = tableH;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    group.add(tableTop);

    // 4 Corner Wooden Legs
    const legGeo = new THREE.BoxGeometry(0.12, tableH, 0.12);
    const legPositions: [number, number][] = [
      [-stallW / 2 + 0.1, -stallD / 2 + 0.1],
      [stallW / 2 - 0.1, -stallD / 2 + 0.1],
      [-stallW / 2 + 0.1, stallD / 2 - 0.1],
      [stallW / 2 - 0.1, stallD / 2 - 0.1],
    ];
    legPositions.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(lx, tableH / 2, lz);
      group.add(leg);
    });

    // 2. Canopy Support Poles (extending to 2.4m height)
    const poleGeo = new THREE.BoxGeometry(0.08, 1.6, 0.08);
    const p1 = new THREE.Mesh(poleGeo, woodMat);
    p1.position.set(-stallW / 2 + 0.1, tableH + 0.8, -stallD / 2 + 0.1);
    const p2 = new THREE.Mesh(poleGeo, woodMat);
    p2.position.set(stallW / 2 - 0.1, tableH + 0.8, -stallD / 2 + 0.1);
    const p3 = new THREE.Mesh(poleGeo, woodMat);
    p3.position.set(-stallW / 2 + 0.1, tableH + 0.65, stallD / 2 - 0.1);
    const p4 = new THREE.Mesh(poleGeo, woodMat);
    p4.position.set(stallW / 2 - 0.1, tableH + 0.65, stallD / 2 - 0.1);
    group.add(p1, p2, p3, p4);

    // 3. Striped Canvas Awning (slanted forward)
    const awningGroup = new THREE.Group();
    awningGroup.position.set(0, tableH + 1.45, 0);
    awningGroup.rotation.x = 0.15; // Slant forward to shed tropical rain

    const stripeCount = 6;
    const stripeW = (stallW + 0.3) / stripeCount;
    const stripeGeo = new THREE.BoxGeometry(stripeW, 0.04, stallD + 0.4);
    const mat1 = new THREE.MeshStandardMaterial({
      color: awningColor1,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    const mat2 = new THREE.MeshStandardMaterial({
      color: awningColor2,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < stripeCount; i++) {
      const sMesh = new THREE.Mesh(stripeGeo, i % 2 === 0 ? mat1 : mat2);
      sMesh.position.x = -((stallW + 0.3) / 2) + (i + 0.5) * stripeW;
      sMesh.castShadow = true;
      awningGroup.add(sMesh);
    }
    group.add(awningGroup);

    // 4. Wares / Crates on Counter
    const crateGeo = new THREE.BoxGeometry(0.6, 0.35, 0.5);
    const crateMat1 = new THREE.MeshStandardMaterial({ color: 0x059669 }); // Produce green
    const crateMat2 = new THREE.MeshStandardMaterial({ color: 0xe11d48 }); // Textiles red
    const crateMat3 = new THREE.MeshStandardMaterial({ color: 0x0284c7 }); // Electronics blue

    const c1 = new THREE.Mesh(crateGeo, crateMat1);
    c1.position.set(-0.7, tableH + 0.22, 0);
    const c2 = new THREE.Mesh(crateGeo, crateMat2);
    c2.position.set(0, tableH + 0.22, 0.1);
    const c3 = new THREE.Mesh(crateGeo, crateMat3);
    c3.position.set(0.7, tableH + 0.22, -0.1);
    group.add(c1, c2, c3);

    const aabb: AABB = {
      minX: x - stallW / 2 - 0.2,
      maxX: x + stallW / 2 + 0.2,
      minZ: z - stallD / 2 - 0.2,
      maxZ: z + stallD / 2 + 0.2,
      label: `Stall: ${name}`,
    };

    return { mesh: group, aabb };
  }

  /**
   * Builds concrete utility poles with cross-arms and transformer canister.
   */
  public static createUtilityPole(x: number, z: number): LagosPropResult {
    const group = new THREE.Group();
    group.name = 'UtilityPole';
    group.position.set(x, 0, z);

    const poleH = 7.0;
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, poleH, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = poleH / 2;
    pole.castShadow = true;
    group.add(pole);

    // Cross-arms
    const armGeo = new THREE.BoxGeometry(2.0, 0.12, 0.12);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x475569 });

    const armUpper = new THREE.Mesh(armGeo, armMat);
    armUpper.position.set(0, poleH - 0.4, 0);
    group.add(armUpper);

    const armLower = new THREE.Mesh(armGeo, armMat);
    armLower.position.set(0, poleH - 1.2, 0);
    group.add(armLower);

    // Ceramic Insulators
    const insGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.15, 6);
    const insMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    [-0.8, -0.3, 0.3, 0.8].forEach(ix => {
      const ins1 = new THREE.Mesh(insGeo, insMat);
      ins1.position.set(ix, poleH - 0.3, 0);
      const ins2 = new THREE.Mesh(insGeo, insMat);
      ins2.position.set(ix, poleH - 1.1, 0);
      group.add(ins1, ins2);
    });

    // Transformer Canister on pole
    const transGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.9, 10);
    const transMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.6,
      roughness: 0.4,
    });
    const transformer = new THREE.Mesh(transGeo, transMat);
    transformer.position.set(0.3, poleH - 2.2, 0);
    group.add(transformer);

    const aabb: AABB = {
      minX: x - 0.35,
      maxX: x + 0.35,
      minZ: z - 0.35,
      maxZ: z + 0.35,
      label: 'Utility Pole',
    };

    return { mesh: group, aabb };
  }

  /**
   * Builds an official Lagos State green & white enamel street name sign.
   */
  public static createStreetSign(
    x: number,
    z: number,
    streetName: string,
    rotationY = 0
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = `StreetSign_${streetName}`;
    group.position.set(x, 0, z);
    group.rotation.y = rotationY;

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 3.2, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.6;
    group.add(pole);

    // Lagos Green Signboard
    const signW = Math.max(1.4, streetName.length * 0.11);
    const signH = 0.32;
    const signGeo = new THREE.BoxGeometry(signW, signH, 0.04);
    const signMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Official Lagos State green
      roughness: 0.4,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 3.0, 0);
    group.add(sign);

    // White Border Trim
    const borderGeo = new THREE.BoxGeometry(signW + 0.04, signH + 0.04, 0.03);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.set(0, 3.0, 0);
    group.add(border);

    // Contrasting White Lettering Bar Accent
    const textBarGeo = new THREE.BoxGeometry(signW - 0.15, 0.12, 0.05);
    const textBarMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const textBar = new THREE.Mesh(textBarGeo, textBarMat);
    textBar.position.set(0, 3.0, 0);
    group.add(textBar);

    return group;
  }

  /**
   * Builds realistic tropical royal palm trees with natural curved segmented trunks,
   * swollen fiber base, coconut clusters, smooth green crownshaft, and cascading feathered fronds.
   */
  public static createPalmTree(x: number, z: number, height = 6.2): THREE.Group {
    const group = new THREE.Group();
    group.name = 'PalmTree';
    group.position.set(x, 0, z);

    // 1. Swollen Trunk Base (Boot)
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x3d271d,
      roughness: 0.9,
    });
    const baseGeo = new THREE.CylinderGeometry(0.38, 0.48, 0.6, 12);
    const trunkBase = new THREE.Mesh(baseGeo, baseMat);
    trunkBase.position.y = 0.3;
    trunkBase.castShadow = true;
    group.add(trunkBase);

    // 2. Segmented Curved Trunk with Bark Ring Geometry
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x5a3e2b,
      roughness: 0.85,
    });
    const segments = 8;
    const trunkHeight = height - 1.2;
    const segH = trunkHeight / segments;

    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const radiusBottom = 0.36 - t * 0.12;
      const radiusTop = 0.36 - (t + 1 / segments) * 0.12;
      const segGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, segH, 12);
      const seg = new THREE.Mesh(segGeo, trunkMat);
      seg.position.y = 0.6 + i * segH + segH / 2;
      // Graceful organic tropical lean
      seg.position.x = Math.sin(t * 1.4) * 0.35;
      seg.position.z = Math.sin(t * 0.8) * 0.15;
      seg.castShadow = true;
      group.add(seg);

      // Bark Ring Collar
      const ringGeo = new THREE.TorusGeometry(radiusBottom * 1.05, 0.02, 6, 12);
      const ring = new THREE.Mesh(ringGeo, baseMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(seg.position.x, 0.6 + i * segH, seg.position.z);
      group.add(ring);
    }

    const crownX = Math.sin(1.4) * 0.35;
    const crownZ = Math.sin(0.8) * 0.15;
    const crownBaseY = 0.6 + trunkHeight;

    // 3. Smooth Green Crownshaft (characteristic of Royal Palms)
    const crownshaftMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.5,
    });
    const crownshaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.24, 0.9, 12),
      crownshaftMat
    );
    crownshaft.position.set(crownX, crownBaseY + 0.45, crownZ);
    crownshaft.castShadow = true;
    group.add(crownshaft);

    // 4. Hanging Coconut / Date Clusters
    const nutMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.7,
    });
    const nutGeo = new THREE.SphereGeometry(0.12, 8, 8);
    for (let n = 0; n < 8; n++) {
      const angle = (n / 8) * Math.PI * 2;
      const nut = new THREE.Mesh(nutGeo, nutMat);
      nut.position.set(
        crownX + Math.cos(angle) * 0.28,
        crownBaseY + 0.2 + (n % 2) * 0.1,
        crownZ + Math.sin(angle) * 0.28
      );
      group.add(nut);
    }

    // 5. Gracefully Arching Lush Compound Palm Fronds (3 tiers of radial fronds)
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.5,
      side: THREE.DoubleSide,
    });

    const frondTiers = [
      { count: 6, droop: 0.45, length: 3.4, yOffset: 0.9 }, // Top canopy
      { count: 7, droop: 0.85, length: 3.8, yOffset: 0.7 }, // Mid canopy
      { count: 7, droop: 1.25, length: 3.6, yOffset: 0.5 }, // Drooping lower canopy
    ];

    frondTiers.forEach((tier, tierIdx) => {
      for (let f = 0; f < tier.count; f++) {
        const angle = (f / tier.count) * Math.PI * 2 + tierIdx * 0.4;
        const frondGroup = new THREE.Group();
        frondGroup.position.set(crownX, crownBaseY + tier.yOffset, crownZ);
        frondGroup.rotation.y = angle;

        // Curved arching stem
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.7 });
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.05, tier.length, 6),
          stemMat
        );
        stem.rotation.z = tier.droop;
        stem.position.set(Math.sin(tier.droop) * (tier.length / 2), Math.cos(tier.droop) * (tier.length / 2), 0);
        frondGroup.add(stem);

        // Feathered Leaf Blades along stem
        const bladeCount = 6;
        for (let b = 1; b <= bladeCount; b++) {
          const bt = b / bladeCount;
          const bladeW = (1 - bt * 0.6) * 0.75;
          const bladeL = 0.55;
          const bladeGeo = new THREE.PlaneGeometry(bladeW, bladeL);
          const blade = new THREE.Mesh(bladeGeo, frondMat);
          blade.rotation.x = Math.PI / 2;
          blade.rotation.z = tier.droop;
          blade.position.set(
            Math.sin(tier.droop) * (tier.length * bt),
            Math.cos(tier.droop) * (tier.length * bt),
            0
          );
          blade.castShadow = true;
          frondGroup.add(blade);
        }

        group.add(frondGroup);
      }
    });

    return group;
  }

  /**
   * Builds high-resolution commercial LED advertising billboard displays:
   * Authentic Nigerian brands (MTN 5G, Flutterwave, Cyberlife OS, GTCO Private Bank)
   * mounted on heavy structural steel truss frames with overhead gooseneck LED spotlight fixtures.
   */
  public static createBillboardAd(
    x: number,
    y: number,
    z: number,
    rotationY: number,
    brand:
      | 'MTN_5G'
      | 'FLUTTERWAVE'
      | 'CYBERLIFE_OS'
      | 'GTCO_BANK'
      | 'PAYSTACK'
      | 'OPAY'
      | 'STARLINK'
      | 'CYBER_DEFENSE'
      | 'GOOGLE_ADMOB',
    width = 7.0,
    height = 3.6
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = `BillboardAd_${brand}`;
    group.position.set(x, y, z);
    group.rotation.y = rotationY;

    // 1. Dynamic High-Res Advertising Texture via HTML Canvas
    let adTexture: THREE.CanvasTexture | null = null;
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        if (brand === 'MTN_5G') {
          // Vibrant MTN Yellow & Black Brand
          ctx.fillStyle = '#facc15';
          ctx.fillRect(0, 0, 1024, 512);

          // Subtle circuit lines
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(880, 256, 180, 0, Math.PI * 2);
          ctx.arc(880, 256, 260, 0, Math.PI * 2);
          ctx.stroke();

          // MTN Oval Logo
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.ellipse(160, 110, 80, 48, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('MTN', 160, 122);

          // 5G Headline
          ctx.fillStyle = '#0f172a';
          ctx.font = '900 68px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('5G IS HERE', 80, 240);

          ctx.font = 'bold 38px sans-serif';
          ctx.fillText('LAGOS ISLAND HIGH-SPEED GRID', 80, 300);

          ctx.fillStyle = '#1e293b';
          ctx.font = '28px sans-serif';
          ctx.fillText('Ultra-low latency across Broad Street & Marina Boulevard', 80, 360);

          // Footer pill
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(80, 410, 380, 56);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText('EVERYWHERE YOU GO • 5G+', 100, 446);
        } else if (brand === 'FLUTTERWAVE') {
          // Modern Fintech Indigo / Midnight Blue & Cyan Wave
          const grad = ctx.createLinearGradient(0, 0, 1024, 512);
          grad.addColorStop(0, '#0b1329');
          grad.addColorStop(1, '#1e1b4b');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1024, 512);

          // Glowing wave ribbon
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.moveTo(0, 400);
          ctx.bezierCurveTo(300, 250, 700, 450, 1024, 180);
          ctx.stroke();

          // Logo & Headline
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 64px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('flutterwave', 80, 150);

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 44px sans-serif';
          ctx.fillText('Endless Possibilities for Global Commerce', 80, 240);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '30px sans-serif';
          ctx.fillText('Powering millions of transactions across African tech ecosystems', 80, 310);

          // Button pill
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(80, 380, 320, 60);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 26px sans-serif';
          ctx.fillText('ACCEPT PAYMENTS →', 105, 420);
        } else if (brand === 'CYBERLIFE_OS') {
          // Cyberlife Neural Defense Grid
          ctx.fillStyle = '#09090b';
          ctx.fillRect(0, 0, 1024, 512);

          // Neon Grid overlay
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2;
          for (let gx = 0; gx < 1024; gx += 64) {
            ctx.beginPath();
            ctx.moveTo(gx, 0);
            ctx.lineTo(gx, 512);
            ctx.stroke();
          }
          for (let gy = 0; gy < 512; gy += 64) {
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(1024, gy);
            ctx.stroke();
          }

          // Glowing Header
          ctx.fillStyle = '#00f0ff';
          ctx.font = '900 60px monospace';
          ctx.textAlign = 'left';
          ctx.fillText('CYBERLIFE OS 4.0', 80, 140);

          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 36px monospace';
          ctx.fillText('[!] NEURAL SECURITY GRID ONLINE', 80, 220);

          ctx.fillStyle = '#e2e8f0';
          ctx.font = '28px sans-serif';
          ctx.fillText('Real-time biometric surveillance & endpoint intrusion monitoring', 80, 290);
          ctx.fillText('Broad Street Security Subnet 07: SECURE', 80, 340);

          ctx.fillStyle = '#10b981';
          ctx.fillRect(80, 390, 400, 50);
          ctx.fillStyle = '#09090b';
          ctx.font = 'bold 26px monospace';
          ctx.fillText('PROTECT YOUR SYSTEM', 105, 425);
        } else if (brand === 'GTCO_BANK') {
          // GTCO Private Banking
          ctx.fillStyle = '#111827';
          ctx.fillRect(0, 0, 1024, 512);

          // Gold Accent Bar
          ctx.fillStyle = '#d97706';
          ctx.fillRect(0, 0, 1024, 24);

          ctx.fillStyle = '#f8fafc';
          ctx.font = '900 56px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('GTCO PRIVATE BANKING', 80, 160);

          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 38px sans-serif';
          ctx.fillText('Marina Waterfront Financial Center', 80, 240);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '28px sans-serif';
          ctx.fillText('Dedicated private wealth management for corporate leaders', 80, 320);

          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 4;
          ctx.strokeRect(80, 380, 340, 56);
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText('SCHEDULE A CONSULTATION', 100, 416);
        } else if (brand === 'PAYSTACK') {
          // Paystack Modern Online Payments
          ctx.fillStyle = '#091e42';
          ctx.fillRect(0, 0, 1024, 512);

          ctx.fillStyle = '#00c3f7';
          ctx.fillRect(0, 0, 1024, 20);

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 62px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('paystack', 80, 150);

          ctx.fillStyle = '#00c3f7';
          ctx.font = 'bold 42px sans-serif';
          ctx.fillText('Modern Online & Offline Payments in Nigeria', 80, 230);

          ctx.fillStyle = '#e2e8f0';
          ctx.font = '28px sans-serif';
          ctx.fillText('Cards • Bank Transfers • USSD • Apple Pay • POS Terminals', 80, 305);

          ctx.fillStyle = '#00c3f7';
          ctx.fillRect(80, 380, 330, 58);
          ctx.fillStyle = '#091e42';
          ctx.font = 'bold 26px sans-serif';
          ctx.fillText('CREATE ACCOUNT →', 105, 418);
        } else if (brand === 'OPAY') {
          // OPay Beyond Banking
          ctx.fillStyle = '#052e16';
          ctx.fillRect(0, 0, 1024, 512);

          ctx.fillStyle = '#00b875';
          ctx.fillRect(0, 0, 1024, 22);

          ctx.fillStyle = '#00b875';
          ctx.font = '900 66px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('OPay', 80, 150);

          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 42px sans-serif';
          ctx.fillText('Fast, Secure & Free Money Transfers', 80, 230);

          ctx.fillStyle = '#a7f3d0';
          ctx.font = '28px sans-serif';
          ctx.fillText('Instant debit card issuance across Lagos Island agent kiosks', 80, 305);

          ctx.fillStyle = '#00b875';
          ctx.fillRect(80, 380, 300, 58);
          ctx.fillStyle = '#052e16';
          ctx.font = 'bold 26px sans-serif';
          ctx.fillText('DOWNLOAD APP', 110, 418);
        } else if (brand === 'STARLINK') {
          // Starlink High-Speed Satellite Internet
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, 1024, 512);

          ctx.fillStyle = '#ffffff';
          ctx.font = '900 70px monospace';
          ctx.textAlign = 'left';
          ctx.fillText('STARLINK', 80, 150);

          ctx.fillStyle = '#67e8f9';
          ctx.font = 'bold 38px sans-serif';
          ctx.fillText('HIGH-SPEED LOW-LATENCY SATELLITE INTERNET', 80, 230);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '28px sans-serif';
          ctx.fillText('Available throughout Lagos, Marina waterfront, & nationwide Nigeria', 80, 305);

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.strokeRect(80, 380, 280, 58);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText('ORDER KIT ONLINE', 105, 416);
        } else if (brand === 'CYBER_DEFENSE') {
          // Lagos Cyber Defense Alliance / Cyber Command
          ctx.fillStyle = '#0a0f1d';
          ctx.fillRect(0, 0, 1024, 512);

          // Cyan & Emerald security header stripe
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(0, 0, 512, 16);
          ctx.fillStyle = '#10b981';
          ctx.fillRect(512, 0, 512, 16);

          // Cyber Command Badge Outline
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 3;
          ctx.strokeRect(60, 60, 904, 392);

          ctx.fillStyle = '#06b6d4';
          ctx.font = '900 48px monospace';
          ctx.textAlign = 'left';
          ctx.fillText('LAGOS CYBER DEFENSE ALLIANCE', 90, 140);

          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 36px sans-serif';
          ctx.fillText('BROAD STREET // SECURE FINANCIAL CORRIDOR', 90, 220);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '26px monospace';
          ctx.fillText('24/7 SIEM TELEMETRY • ENDPOINT THREAT ISOLATION • NDPR AUDITED', 90, 290);
          ctx.fillText('CEDARLINE SEC-OPS • MARINA FINANCIAL SECTOR GATEWAY', 90, 335);

          ctx.fillStyle = '#10b981';
          ctx.fillRect(90, 375, 380, 56);
          ctx.fillStyle = '#022c22';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText('THREAT LEVEL: NOMINAL', 110, 412);

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 22px monospace';
          ctx.fillText('SECTOR 04 // ACTIVE NODES: 1,420', 500, 412);
        }

        adTexture = new THREE.CanvasTexture(canvas);
        adTexture.colorSpace = THREE.SRGBColorSpace;
      }
    }

    // 2. Front Billboard Panel
    const boardMat = new THREE.MeshStandardMaterial({
      map: adTexture,
      emissiveMap: adTexture,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.1,
    });
    const boardGeo = new THREE.BoxGeometry(width, height, 0.12);
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    boardMesh.castShadow = true;
    boardMesh.receiveShadow = true;
    group.add(boardMesh);

    // 3. Heavy Steel Outer Bezel
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.3,
    });
    const frameGeo = new THREE.BoxGeometry(width + 0.3, height + 0.3, 0.16);
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.z = -0.04;
    group.add(frameMesh);

    // 4. Rear Steel Lattice Truss Support
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const rearTruss = new THREE.Mesh(new THREE.BoxGeometry(width * 0.9, height * 0.8, 0.4), trussMat);
    rearTruss.position.z = -0.3;
    group.add(rearTruss);

    // 5. Dual Overhead Gooseneck LED Spotlight Fixtures
    const spotLampMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // warm spotlight glow

    [-width * 0.3, width * 0.3].forEach(lx => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), spotLampMat);
      arm.rotation.x = -Math.PI / 3;
      arm.position.set(lx, height / 2 + 0.35, 0.35);
      group.add(arm);

      const lampHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.25), spotLampMat);
      lampHead.position.set(lx, height / 2 + 0.65, 0.65);
      lampHead.rotation.x = Math.PI / 4;
      group.add(lampHead);

      const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), lensMat);
      lens.position.set(lx, height / 2 + 0.6, 0.72);
      lens.rotation.x = Math.PI / 4;
      group.add(lens);
    });

    return group;
  }

  /**
   * Modern Lagos Bus Stop Shelter with overhead protective canopy, commuter seating bench,
   * official bus route directory map, and an illuminated portrait digital ad kiosk (Google AdMob ready).
   */
  public static createBusShelterWithAd(
    x: number,
    y: number,
    z: number,
    rotationY: number,
    adSlotId = 'admob_bus_shelter_danfo'
  ): LagosPropResult {
    const group = new THREE.Group();
    group.name = `BusShelter_${adSlotId}`;
    group.position.set(x, y, z);
    group.rotation.y = rotationY;

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.25,
    });
    const canopyMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.75,
      roughness: 0.15,
      metalness: 0.8,
    });
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.7 });

    // 1. Canopy Roof & Uprights
    const w = 4.2;
    const d = 1.8;
    const h = 2.6;

    // 4 Support Columns
    [-w / 2 + 0.15, w / 2 - 0.15].forEach(cx => {
      [-d / 2 + 0.15, d / 2 - 0.15].forEach(cz => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, h, 8), steelMat);
        post.position.set(cx, h / 2, cz);
        post.castShadow = true;
        group.add(post);
      });
    });

    // Overhead curved canopy roof
    const roof = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.08, d + 0.4), canopyMat);
    roof.position.set(0, h + 0.04, 0);
    roof.castShadow = true;
    group.add(roof);

    // Rear Windscreen Glass
    const backGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.45,
      roughness: 0.1,
    });
    const backGlass = new THREE.Mesh(new THREE.BoxGeometry(w - 0.3, h * 0.75, 0.04), backGlassMat);
    backGlass.position.set(0, h * 0.55, -d / 2 + 0.15);
    group.add(backGlass);

    // 2. Commuter Bench
    const bench = new THREE.Mesh(new THREE.BoxGeometry(w * 0.65, 0.08, 0.4), woodMat);
    bench.position.set(0, 0.48, -d / 2 + 0.38);
    bench.castShadow = true;
    group.add(bench);

    // 3. Illuminated Digital Ad Kiosk (Google AdMob Portrait Display)
    let kioskAdTexture: THREE.CanvasTexture | null = null;
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, 512, 1024);

        // Google AdMob Header
        ctx.fillStyle = '#4285f4';
        ctx.fillRect(0, 0, 128, 12);
        ctx.fillStyle = '#ea4335';
        ctx.fillRect(128, 0, 128, 12);
        ctx.fillStyle = '#fbbc05';
        ctx.fillRect(256, 0, 128, 12);
        ctx.fillStyle = '#34a853';
        ctx.fillRect(384, 0, 128, 12);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 48px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Google AdMob', 256, 100);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 30px sans-serif';
        ctx.fillText('PREMIUM TRANSIT AD', 256, 160);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '22px sans-serif';
        ctx.fillText('Lagos Island Broad St Station', 256, 210);
        ctx.fillText(`Slot ID: ${adSlotId}`, 256, 245);

        // Graphic Ad Container
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 4;
        ctx.strokeRect(36, 290, 440, 520);

        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText('CONNECT YOUR BRAND', 256, 360);

        ctx.fillStyle = '#f8fafc';
        ctx.font = '24px sans-serif';
        ctx.fillText('Reach 250,000+ daily', 256, 440);
        ctx.fillText('commuters across Lagos Island', 256, 480);
        ctx.fillText('financial and tech districts.', 256, 520);

        ctx.fillStyle = '#10b981';
        ctx.fillRect(56, 680, 400, 64);
        ctx.fillStyle = '#09090b';
        ctx.font = 'bold 28px sans-serif';
        ctx.fillText('BOOK ADMOB CAMPAIGN', 256, 722);

        // Footer info
        ctx.fillStyle = '#64748b';
        ctx.font = '18px monospace';
        ctx.fillText('LAMATA • LAGOS STATE TRANSIT', 256, 920);

        kioskAdTexture = new THREE.CanvasTexture(canvas);
        kioskAdTexture.colorSpace = THREE.SRGBColorSpace;
      }
    }

    const kioskMat = new THREE.MeshStandardMaterial({
      map: kioskAdTexture,
      emissiveMap: kioskAdTexture,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.45,
      roughness: 0.2,
      metalness: 0.1,
    });

    const kioskMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.8, 0.12), kioskMat);
    kioskMesh.position.set(w / 2 + 0.45, 1.05, 0);
    kioskMesh.castShadow = true;
    group.add(kioskMesh);

    const kioskFrameMat = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.9 });
    const kioskFrame = new THREE.Mesh(new THREE.BoxGeometry(0.95, 1.9, 0.16), kioskFrameMat);
    kioskFrame.position.set(w / 2 + 0.45, 1.05, 0);
    group.add(kioskFrame);

    const halfX = (rotationY !== 0 ? d : w) / 2 + 0.3;
    const halfZ = (rotationY !== 0 ? w : d) / 2 + 0.3;

    return {
      mesh: group,
      aabb: {
        minX: x - halfX,
        maxX: x + halfX,
        minZ: z - halfZ,
        maxZ: z + halfZ,
        label: 'Bus Shelter & AdMob Kiosk',
      },
    };
  }



  /**
   * Builds the iconic Broad Street Overhead Portal Arch / District Gateway Gantry:
   * Spanning across the 10m roadway from sidewalk to sidewalk at z = -36.
   * Clear roadway clearance under the arch allows buses and cars to drive freely underneath.
   */
  public static createWelcomePortalArch(z = -36): THREE.Group {
    const group = new THREE.Group();
    group.name = 'BroadStreetWelcomePortal';
    group.position.set(0, 0, z);

    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Concrete & reinforced steel
      roughness: 0.8,
      metalness: 0.3,
    });
    const trussMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.85,
    });

    // 1. Twin Side Support Pillars (placed safely on sidewalks at x = -5.8 and x = 5.8)
    const pillarHeight = 6.4;
    const pillarGeo = new THREE.BoxGeometry(0.8, pillarHeight, 0.8);

    [-5.8, 5.8].forEach(px => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(px, pillarHeight / 2, 0);
      pillar.castShadow = true;
      group.add(pillar);

      // Flashing Caution Beacon Light at top
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), beaconMat);
      beacon.position.set(px, pillarHeight + 0.15, 0);
      group.add(beacon);
    });

    // 2. Overhead Structural Box Truss Beam (clearance height: 5.6m)
    const trussW = 12.4;
    const trussH = 0.9;
    const trussGeo = new THREE.BoxGeometry(trussW, trussH, 0.7);
    const trussMesh = new THREE.Mesh(trussGeo, trussMat);
    trussMesh.position.set(0, pillarHeight - trussH / 2, 0);
    trussMesh.castShadow = true;
    group.add(trussMesh);

    // 3. Highway Sign Panel (Official Lagos State Green & White)
    const signMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Lagos State highway green
      roughness: 0.4,
    });
    const signGeo = new THREE.BoxGeometry(10.2, 1.4, 0.12);
    const signBoard = new THREE.Mesh(signGeo, signMat);
    signBoard.position.set(0, pillarHeight - 0.1, 0.42);
    group.add(signBoard);

    // White reflective border trim
    const borderMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const borderGeo = new THREE.BoxGeometry(10.3, 1.5, 0.08);
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.set(0, pillarHeight - 0.1, 0.38);
    group.add(border);

    // Dynamic sign text via canvas
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, 0, 1024, 256);

        // White border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 10;
        ctx.strokeRect(10, 10, 1004, 236);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LAGOS STATE CENTRAL BUSINESS DISTRICT', 512, 75);

        ctx.fillStyle = '#fef08a';
        ctx.font = '900 52px sans-serif';
        ctx.fillText('BROAD STREET  •  TINUBU SQUARE', 512, 145);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 34px sans-serif';
        ctx.fillText('↓ MARINA WATERFRONT | BALOGUN MARKET →', 512, 210);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        const textMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(10.0, 1.3),
          new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.3,
            emissiveMap: tex,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.3,
          })
        );
        textMesh.position.set(0, pillarHeight - 0.1, 0.49);
        group.add(textMesh);
      }
    }

    return group;
  }

  /**
   * Builds the Marina waterfront seawall, safety railings, and mooring bollards.
   */
  public static createSeawall(z: number, minX: number, maxX: number): LagosPropResult {
    const group = new THREE.Group();
    group.name = 'MarinaSeawall';

    const wallW = maxX - minX;
    const wallH = 1.2;
    const wallD = 1.6;
    const centerX = (minX + maxX) / 2;

    // 1. Concrete Seawall Coping
    const wallGeo = new THREE.BoxGeometry(wallW, wallH, wallD);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // weathered seawall concrete
      roughness: 0.9,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(centerX, wallH / 2, z);
    wall.receiveShadow = true;
    wall.castShadow = true;
    group.add(wall);

    // 2. Safety Railings (Steel stanchions and top rail)
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.3,
    });
    const topRailGeo = new THREE.BoxGeometry(wallW, 0.08, 0.08);
    const topRail = new THREE.Mesh(topRailGeo, railMat);
    topRail.position.set(centerX, wallH + 0.6, z);
    group.add(topRail);

    const midRailGeo = new THREE.BoxGeometry(wallW, 0.05, 0.05);
    const midRail = new THREE.Mesh(midRailGeo, railMat);
    midRail.position.set(centerX, wallH + 0.3, z);
    group.add(midRail);

    // Posts along railing every 4m
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.65, 8);
    for (let px = minX + 2; px <= maxX - 2; px += 4) {
      const post = new THREE.Mesh(postGeo, railMat);
      post.position.set(px, wallH + 0.32, z);
      group.add(post);

      // Mooring Bollards on seawall edge every 8m
      if (Math.abs(px % 8) < 1) {
        const bollardGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.5, 10);
        const bollardMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
        const bollard = new THREE.Mesh(bollardGeo, bollardMat);
        bollard.position.set(px, wallH + 0.25, z - 0.4);
        group.add(bollard);
      }
    }

    const aabb: AABB = {
      minX,
      maxX,
      minZ: z - wallD / 2 - 0.2,
      maxZ: z + wallD / 2 + 0.2,
      label: 'Marina Waterfront Seawall',
    };

    return { mesh: group, aabb };
  }

  /**
   * Builds the historic Tinubu Square central commemorative fountain & monument.
   */
  public static createTinubuMonument(x: number, z: number): LagosPropResult {
    const group = new THREE.Group();
    group.name = 'TinubuSquareMonument';
    group.position.set(x, 0, z);

    // 1. Decorative Circular Stone Basin (Octagonal approximation)
    const baseGeo = new THREE.CylinderGeometry(4.2, 4.5, 0.7, 16);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Light granite stone
      roughness: 0.7,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.35;
    base.receiveShadow = true;
    base.castShadow = true;
    group.add(base);

    // Water surface inside basin
    const waterGeo = new THREE.CylinderGeometry(3.9, 3.9, 0.1, 16);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 0.65;
    group.add(water);

    // 2. Central Tiered Plinth
    const plinthGeo = new THREE.BoxGeometry(2.0, 1.2, 2.0);
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 1.2;
    plinth.castShadow = true;
    group.add(plinth);

    // 3. Central Commemorative Pillar / Obelisk (Dedicated to Madam Efunroye Tinubu)
    const pillarGeo = new THREE.CylinderGeometry(0.35, 0.6, 4.2, 8);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // White marble / polished limestone
      roughness: 0.3,
    });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 3.9;
    pillar.castShadow = true;
    group.add(pillar);

    // 4. Bronze commemorative plaque on plinth
    const plaqueGeo = new THREE.BoxGeometry(0.9, 0.5, 0.05);
    const plaqueMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Bronze / copper
      metalness: 0.8,
      roughness: 0.3,
    });
    const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaque.position.set(0, 1.2, 1.03);
    group.add(plaque);

    const aabb: AABB = {
      minX: x - 4.4,
      maxX: x + 4.4,
      minZ: z - 4.4,
      maxZ: z + 4.4,
      label: 'Civic Landmark: Tinubu Square Fountain Monument',
    };

    return { mesh: group, aabb };
  }

  /**
   * Builds the ubiquitous Nigerian black cylindrical polyethylene overhead water tank
   * on a steel elevated roof rack.
   */
  public static createWaterTank(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'RooftopWaterTank';
    group.position.set(x, y, z);

    // Steel support stand
    const standH = 0.8;
    const standGeo = new THREE.BoxGeometry(1.6, standH, 1.6);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.y = standH / 2;
    group.add(stand);

    // Black cylindrical plastic tank
    const tankH = 1.6;
    const tankGeo = new THREE.CylinderGeometry(0.75, 0.75, tankH, 14);
    const tankMat = new THREE.MeshStandardMaterial({
      color: 0x09090b, // deep black polyethylene
      roughness: 0.3,
      metalness: 0.1,
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = standH + tankH / 2;
    tank.castShadow = true;
    group.add(tank);

    // Lid
    const lidGeo = new THREE.CylinderGeometry(0.8, 0.77, 0.15, 14);
    const lid = new THREE.Mesh(lidGeo, tankMat);
    lid.position.y = standH + tankH + 0.08;
    group.add(lid);

    return group;
  }

  /**
   * Creates a photorealistic 3D corporate rooftop or facade signboard
   * with emissive logo, company brand styling, and edge lighting.
   */
  public static createCorporateSignboard(options: {
    companyName: string;
    subtext?: string;
    brandColor: string;
    accentColor?: string;
    bgDark?: string;
    width?: number;
    height?: number;
    logoIcon?: 'CYBER' | 'BANK' | 'RISK' | 'PRESS' | 'GOV';
  }): THREE.Group {
    const group = new THREE.Group();
    group.name = `CorporateSign_${options.companyName.replace(/\s+/g, '_')}`;

    const w = options.width ?? 10.0;
    const h = options.height ?? 2.4;
    const d = 0.4;

    // 1. Backplate Frame & Mount
    const frameGeo = new THREE.BoxGeometry(w + 0.3, h + 0.3, d);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.4,
      metalness: 0.8,
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.castShadow = true;
    group.add(frameMesh);

    // 2. Emissive Neon Border Piping
    const borderGeo = new THREE.BoxGeometry(w + 0.15, h + 0.15, d + 0.05);
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      emissive: new THREE.Color(options.accentColor ?? options.brandColor),
      emissiveIntensity: 0.85,
      roughness: 0.2,
    });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    group.add(borderMesh);

    // 3. Dynamic High-Res Corporate Brand Graphic Panel
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Dark metallic gradient background
        const grad = ctx.createLinearGradient(0, 0, 1024, 0);
        grad.addColorStop(0, options.bgDark ?? '#060d1b');
        grad.addColorStop(0.5, '#0f172a');
        grad.addColorStop(1, options.bgDark ?? '#060d1b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 256);

        // Neon brand border
        ctx.strokeStyle = options.brandColor;
        ctx.lineWidth = 6;
        ctx.strokeRect(12, 12, 1000, 232);

        // Logo Icon Crest
        ctx.save();
        ctx.fillStyle = options.brandColor;
        ctx.strokeStyle = options.accentColor ?? '#ffffff';
        ctx.lineWidth = 4;

        if (options.logoIcon === 'BANK') {
          // Geometric vault / financial pillars
          ctx.strokeRect(60, 68, 80, 120);
          ctx.fillRect(80, 88, 40, 80);
          ctx.beginPath();
          ctx.moveTo(40, 68);
          ctx.lineTo(100, 30);
          ctx.lineTo(160, 68);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (options.logoIcon === 'RISK') {
          // Tactical security shield
          ctx.beginPath();
          ctx.moveTo(100, 40);
          ctx.lineTo(150, 70);
          ctx.lineTo(135, 140);
          ctx.lineTo(100, 185);
          ctx.lineTo(65, 140);
          ctx.lineTo(50, 70);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        } else if (options.logoIcon === 'PRESS') {
          // Investigative press quill / newspaper banner
          ctx.strokeRect(55, 60, 90, 130);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(70, 80, 60, 15);
          ctx.fillRect(70, 105, 60, 10);
          ctx.fillRect(70, 125, 60, 10);
          ctx.fillRect(70, 145, 60, 10);
        } else if (options.logoIcon === 'GOV') {
          // Civic federal star & shield
          ctx.beginPath();
          ctx.arc(100, 110, 50, 0, Math.PI * 2);
          ctx.stroke();
          ctx.font = 'bold 50px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('★', 100, 128);
        } else {
          // Cyber life hexagonal node / tech core
          ctx.beginPath();
          ctx.moveTo(100, 45);
          ctx.lineTo(145, 75);
          ctx.lineTo(145, 145);
          ctx.lineTo(100, 175);
          ctx.lineTo(55, 145);
          ctx.lineTo(55, 75);
          ctx.closePath();
          ctx.stroke();
          ctx.fillRect(85, 95, 30, 30);
        }
        ctx.restore();

        // Company Name Typography
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 58px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(options.companyName.toUpperCase(), 190, 115);

        // Subtext / Tagline
        if (options.subtext) {
          ctx.fillStyle = options.accentColor ?? options.brandColor;
          ctx.font = '700 28px sans-serif';
          ctx.fillText(options.subtext.toUpperCase(), 195, 175);
        }

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        const panelMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.2,
            metalness: 0.1,
            emissiveMap: tex,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.8,
          })
        );
        panelMesh.position.set(0, 0, d / 2 + 0.04);
        group.add(panelMesh);
      }
    }

    return group;
  }
}
