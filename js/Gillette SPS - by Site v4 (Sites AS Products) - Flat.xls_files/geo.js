/* Geo Helpers ----------------------------------------------------------------

Helpers for doing complicated geo calculations.

------------------------------------------------------------------------------ */

// Adapted from www.jasondavies.com/maps/intersect/
Sourcemap.intersect = function (a, b) {
  var pi = Math.PI,
    radians = pi / 180,
    e = 1e-6;

function length(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z);
}

    var A0 = a[0][0],
      A1 = a[1][0],
      A2 = b[0][0],
      A3 = b[1][0],
      oA0 = A1 - A0,
      oA1 = A3 - A2,
      aoA0 = Math.abs(oA0),
      aoA1 = Math.abs(oA1),
      sA0 = aoA0 > 180,
      sA1 = aoA1 > 180,
      O0 = a[0][1] * radians,
      O1 = a[1][1] * radians,
      O2 = b[0][1] * radians,
      O3 = b[1][1] * radians,
      t;

  // Ensure A0 ≤ A1 and A2 ≤ A3.
  if (oA0 < 0) t = A0, A0 = A1, A1 = t, t = O0, O0 = O1, O1 = t;
  if (oA1 < 0) t = A2, A2 = A3, A3 = t, t = O2, O2 = O3, O3 = t;

  // Check if longitude ranges overlap.
  // TODO handle antimeridian crossings.
  if (!sA0 && !sA1 && (A0 > A3 || A2 > A1)) return;

  // Check for polar endpoints.
  if (Math.abs(Math.abs(O0) - pi / 2) < e) A0 = A1, aoA0 = oA0 = 0, sA0 = false;
  if (Math.abs(Math.abs(O1) - pi / 2) < e) A1 = A0, aoA0 = oA0 = 0, sA0 = false;
  if (Math.abs(Math.abs(O2) - pi / 2) < e) A2 = A3, aoA1 = oA1 = 0, sA1 = false;
  if (Math.abs(Math.abs(O3) - pi / 2) < e) A3 = A2, aoA1 = oA1 = 0, sA1 = false;

  // Check for arcs along meridians.
  var m0 = aoA0 < e || Math.abs(aoA0 - 180) < e,
      m1 = aoA1 < e || Math.abs(aoA1 - 180) < e;

  A0 *= radians, A1 *= radians, A2 *= radians, A3 *= radians;

  // Intersect two great circles and check the two intersection points against
  // the longitude ranges.  The intersection points are simply the cross
  // product of the great-circle normals ±n1⨯n2.

  // First plane.
  var cosO,
      x0 = (cosO = Math.cos(O0)) * Math.cos(A0),
      y0 = cosO * Math.sin(A0),
      z0 = Math.sin(O0),
      x1 = (cosO = Math.cos(O1)) * Math.cos(A1),
      y1 = cosO * Math.sin(A1),
      z1 = Math.sin(O1),
      n0x = y0 * z1 - z0 * y1,
      n0y = z0 * x1 - x0 * z1,
      n0z = x0 * y1 - y0 * x1,
      m = length(n0x, n0y, n0z);

  n0x /= m, n0y /= m, n0z /= m;

  // Second plane.
  var x2 = (cosO = Math.cos(O2)) * Math.cos(A2),
      y2 = cosO * Math.sin(A2),
      z2 = Math.sin(O2),
      x3 = (cosO = Math.cos(O3)) * Math.cos(A3),
      y3 = cosO * Math.sin(A3),
      z3 = Math.sin(O3),
      n1x = y2 * z3 - z2 * y3,
      n1y = z2 * x3 - x2 * z3,
      n1z = x2 * y3 - y2 * x3,
      m = length(n1x, n1y, n1z);

  n1x /= m, n1y /= m, n1z /= m;

  var Nx = n0y * n1z - n0z * n1y,
      Ny = n0z * n1x - n0x * n1z,
      Nz = n0x * n1y - n0y * n1x;

  if (length(Nx, Ny, Nz) < e) return;

  var A = Math.atan2(Ny, Nx);
  if ((sA0 ^ (A0 <= A && A <= A1) || m0 && Math.abs(A - A0) < e) && (sA1 ^ (A2 <= A && A <= A3) || m1 && Math.abs(A - A2) < e) || (Nz = -Nz,
      (sA0 ^ (A0 <= (A = (A + 2 * pi) % (2 * pi) - pi) && A <= A1) || m0 && Math.abs(A - A0) < e) && (sA1 ^ (A2 <= A && A <= A3) || m1 && Math.abs(A - A2) < e))) {
    var O = Math.asin(Nz / length(Nx, Ny, Nz));
    if (m0 || m1) {
      if (m1) O0 = O2, O1 = O3, A0 = A2, A1 = A3, aoA0 = aoA1;
      if (aoA0 > e) return O0 + O1 > 0 ^ O < (Math.abs(A - A0) < e ? O0 : O1) ? [A / radians, O / radians] : null;
      // Ensure O0 ≤ O1.
      if (O1 < O0) t = O0, O0 = O1, O1 = t;
      return Math.abs(A - (m0 ? A0 : A2)) < e && O0 <= O && O <= O1 ? [A / radians, O / radians] : null;
    }
    return [A / radians, O / radians];
  }
}
