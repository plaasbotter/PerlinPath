<template>
  <v-container fluid>
    <div class="kek">
      <div min-width="50vw">
        <v-card min-width="50vw" class="pb-3">
          <v-card-text>
            <div id="div_template" ref="busstop"></div>
          </v-card-text>
          <p>Click on grid to block off road</p>
          <v-card-actions>
            <v-row justify="space-around">
              <v-btn class="mt-3" @click="ReRender()">RE-RENDER</v-btn>
              <v-switch label="Reverse Perlin" v-model="SWITCH"> </v-switch>
            </v-row>
            
          </v-card-actions>
          
        </v-card>
        <v-card min-width="550px">
          <v-card-title> ACTIONS </v-card-title>
          <v-card-text>
            <v-row>
              <v-col md="6">
                <v-text-field v-model="SEED" type="number" label="SEED">
                </v-text-field>
              </v-col>
              <v-col md="6">
                <v-text-field
                  v-model="MAX_GRID"
                  type="number"
                  label="GRID SIZE"
                >
                </v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col md="6">
                <v-select
                  :items="Object.keys(SCHEMAS)"
                  v-model="SELECTED_SCHEMA"
                  label="COLOUR SCHEME"
                >
                </v-select>
              </v-col>
              <v-col md="6">
                <v-text-field
                  v-model="SCORE"
                  type="number"
                  label="SCORE"
                  readonly
                >
                </v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </div>
      <!-- EXPLANATION -->
      <div>
        <v-card height="100%">
          <v-card-title> DISCUSSION </v-card-title>
          <v-card-text>
            <v-row justify="center" align="center" class="mr-3 ml-3">
              <p style="aas">
                A quick view of ASTAR pathing first published in 1968 by Peter
                Hart, Nils Nilsson and Bertyram Raphael
              </p>
              <p>
                Nils Nilsson originally proposed using the Graph Traverser
                algorithm for Shakey's path planning. Graph Traverser is guided
                by a heuristic function h(n), the estimated distance from node n
                to the goal node: it entirely ignores g(n), the distance from
                the start node to n. Bertram Raphael suggested using the sum,
                g(n) + h(n).
              </p>
              <p>
                Peter Hart invented the concepts we now call admissibility and
                consistency of heuristic functions. A* was originally designed
                for finding least-cost paths when the cost of a path is the sum
                of its costs, but it has been shown that A* can be used to find
                optimal paths for any problem satisfying the conditions of a
                cost algebra
              </p>
              <v-img
                class="shrink ma-3"
                contain
                :src="require('../assets/thingy.svg')"
                transition="scale-transition"
                width="30%"
              />
              <p>
                Consider the small grid as an attempt to simplify the problem.
                The algorithm needs to travel from top left to bottom right. The
                movement cost is calculated from the number of the next grid
                (g(n)) and the distance to the target (h(n)). Only vertical and
                horizontal movements are considered.
              </p>
              <p>
                Since we start at the top left, we can ignore the square. Let's
                consider the next two possible locations (2 and 7). The yellow
                square will have a total score of f(n) = g(n) + h(n) which
                calculates to f(n) = 2 + 4 = 6. The blue block will have a score
                of 11. We keep both. For the next iteration of calculations we
                will start with the lowest value from the previous calculations
                (yellow in this case) and continue onto 8 and so forth until we
                reach the end.
              </p>
              <p>
                Warning<br>Grid is 512 x 512, so max grid size should be less than 256
              </p>
              <p>
                Notes<br>System is not stable, so should the path disappear, please refresh page
              </p>
              <p>
                Reference<br>Most of the text in the discussion was liberally used from Wikipedia
              </p>
            </v-row>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </v-container>
</template>

<script>
class Perlin {
  constructor(seed) {
    // Alea random number generator.
    //----------------------------------------------------------------------------//

    // From http://baagoe.com/en/RandomMusings/javascript/
    function Alea() {
      return (function (args) {
        // Johannes BaagÃ¸e <baagoe@baagoe.com>, 2010
        var s0 = 0;
        var s1 = 0;
        var s2 = 0;
        var c = 1;

        if (args.length == 0) {
          args = [+new Date()];
        }
        var mash = Mash();
        s0 = mash(" ");
        s1 = mash(" ");
        s2 = mash(" ");

        for (var i = 0; i < args.length; i++) {
          s0 -= mash(args[i]);
          if (s0 < 0) {
            s0 += 1;
          }
          s1 -= mash(args[i]);
          if (s1 < 0) {
            s1 += 1;
          }
          s2 -= mash(args[i]);
          if (s2 < 0) {
            s2 += 1;
          }
        }
        mash = null;

        var random = function () {
          var t = 2091639 * s0 + c * 2.3283064365386963e-10; // 2^-32
          s0 = s1;
          s1 = s2;
          return (s2 = t - (c = t | 0));
        };
        random.uint32 = function () {
          return random() * 0x100000000; // 2^32
        };
        random.fract53 = function () {
          return (
            random() + ((random() * 0x200000) | 0) * 1.1102230246251565e-16
          ); // 2^-53
        };
        random.version = "Alea 0.9";
        random.args = args;
        return random;
      })(Array.prototype.slice.call(arguments));
    }

    // From http://baagoe.com/en/RandomMusings/javascript/
    // Johannes BaagÃ¸e <baagoe@baagoe.com>, 2010
    function Mash() {
      var n = 0xefc8249d;

      var mash = function (data) {
        data = data.toString();
        for (var i = 0; i < data.length; i++) {
          n += data.charCodeAt(i);
          var h = 0.02519603282416938 * n;
          n = h >>> 0;
          h -= n;
          h *= n;
          n = h >>> 0;
          h -= n;
          n += h * 0x100000000; // 2^32
        }
        return (n >>> 0) * 2.3283064365386963e-10; // 2^-32
      };

      mash.version = "Mash 0.9";
      return mash;
    }

    // Simplex perlin noise.
    //----------------------------------------------------------------------------//
    // Ported from Stefan Gustavson's java implementation
    // http://staffwww.itn.liu.se/~stegu/simplexnoise/simplexnoise.pdf
    // Read Stefan's excellent paper for details on how this code works.
    //
    // Sean McCullough banksean@gmail.com
    /**
     * You can pass in a random number generator object if you like.
     * It is assumed to have a random() method.
     */
    var SimplexNoise = function (r) {
      if (r == undefined) r = Math;
      this.grad3 = [
        [1, 1, 0],
        [-1, 1, 0],
        [1, -1, 0],
        [-1, -1, 0],
        [1, 0, 1],
        [-1, 0, 1],
        [1, 0, -1],
        [-1, 0, -1],
        [0, 1, 1],
        [0, -1, 1],
        [0, 1, -1],
        [0, -1, -1],
      ];
      this.p = [];
      for (var i = 0; i < 256; i++) {
        this.p[i] = Math.floor(r.random() * 256);
      }
      // To remove the need for index wrapping, double the permutation table length
      this.perm = [];
      for (var j = 0; j < 512; j++) {
        this.perm[j] = this.p[j & 255];
      }

      // A lookup table to traverse the simplex around a given point in 4D.
      // Details can be found where this table is used, in the 4D noise method.
      this.simplex = [
        [0, 1, 2, 3],
        [0, 1, 3, 2],
        [0, 0, 0, 0],
        [0, 2, 3, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 2, 3, 0],
        [0, 2, 1, 3],
        [0, 0, 0, 0],
        [0, 3, 1, 2],
        [0, 3, 2, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 3, 2, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 2, 0, 3],
        [0, 0, 0, 0],
        [1, 3, 0, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [2, 3, 0, 1],
        [2, 3, 1, 0],
        [1, 0, 2, 3],
        [1, 0, 3, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [2, 0, 3, 1],
        [0, 0, 0, 0],
        [2, 1, 3, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [2, 0, 1, 3],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [3, 0, 1, 2],
        [3, 0, 2, 1],
        [0, 0, 0, 0],
        [3, 1, 2, 0],
        [2, 1, 0, 3],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [3, 1, 0, 2],
        [0, 0, 0, 0],
        [3, 2, 0, 1],
        [3, 2, 1, 0],
      ];
    };

    SimplexNoise.prototype.dot = function (g, x, y) {
      return g[0] * x + g[1] * y;
    };

    SimplexNoise.prototype.noise = function (xin, yin) {
      var n0, n1, n2; // Noise contributions from the three corners

      // Skew the input space to determine which simplex cell we're in
      var F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
      var s = (xin + yin) * F2; // Hairy factor for 2D
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var G2 = (3.0 - Math.sqrt(3.0)) / 6.0;
      var t = (i + j) * G2;
      var X0 = i - t; // Unskew the cell origin back to (x,y) space
      var Y0 = j - t;
      var x0 = xin - X0; // The x,y distances from the cell origin
      var y0 = yin - Y0;
      // For the 2D case, the simplex shape is an equilateral triangle.
      // Determine which simplex we are in.
      var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
      if (x0 > y0) {
        i1 = 1;
        j1 = 0;
      } // lower triangle, XY order: (0,0)->(1,0)->(1,1)
      else {
        i1 = 0;
        j1 = 1;
      } // upper triangle, YX order: (0,0)->(0,1)->(1,1)

      // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
      // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
      // c = (3-sqrt(3))/6
      var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
      var y1 = y0 - j1 + G2;
      var x2 = x0 - 1.0 + 2.0 * G2; // Offsets for last corner in (x,y) unskewed coords
      var y2 = y0 - 1.0 + 2.0 * G2;
      // Work out the hashed gradient indices of the three simplex corners
      var ii = i & 255;
      var jj = j & 255;
      var gi0 = this.perm[ii + this.perm[jj]] % 12;
      var gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
      var gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;
      // Calculate the contribution from the three corners
      var t0 = 0.5 - x0 * x0 - y0 * y0;
      if (t0 < 0) n0 = 0.0;
      else {
        t0 *= t0;
        n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0); // (x,y) of grad3 used for 2D gradient
      }
      var t1 = 0.5 - x1 * x1 - y1 * y1;
      if (t1 < 0) n1 = 0.0;
      else {
        t1 *= t1;
        n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1);
      }
      var t2 = 0.5 - x2 * x2 - y2 * y2;
      if (t2 < 0) n2 = 0.0;
      else {
        t2 *= t2;
        n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to return values in the interval [-1,1].
      return 70.0 * (n0 + n1 + n2);
    };

    // 3D simplex noise
    SimplexNoise.prototype.noise3d = function (xin, yin, zin) {
      var n0, n1, n2, n3; // Noise contributions from the four corners

      // Skew the input space to determine which simplex cell we're in
      var F3 = 1.0 / 3.0;
      var s = (xin + yin + zin) * F3; // Very nice and simple skew factor for 3D
      var i = Math.floor(xin + s);
      var j = Math.floor(yin + s);
      var k = Math.floor(zin + s);
      var G3 = 1.0 / 6.0; // Very nice and simple unskew factor, too
      var t = (i + j + k) * G3;
      var X0 = i - t; // Unskew the cell origin back to (x,y,z) space
      var Y0 = j - t;
      var Z0 = k - t;
      var x0 = xin - X0; // The x,y,z distances from the cell origin
      var y0 = yin - Y0;
      var z0 = zin - Z0;
      // For the 3D case, the simplex shape is a slightly irregular tetrahedron.
      // Determine which simplex we are in.
      var i1, j1, k1; // Offsets for second corner of simplex in (i,j,k) coords
      var i2, j2, k2; // Offsets for third corner of simplex in (i,j,k) coords
      if (x0 >= y0) {
        if (y0 >= z0) {
          i1 = 1;
          j1 = 0;
          k1 = 0;
          i2 = 1;
          j2 = 1;
          k2 = 0;
        } // X Y Z order
        else if (x0 >= z0) {
          i1 = 1;
          j1 = 0;
          k1 = 0;
          i2 = 1;
          j2 = 0;
          k2 = 1;
        } // X Z Y order
        else {
          i1 = 0;
          j1 = 0;
          k1 = 1;
          i2 = 1;
          j2 = 0;
          k2 = 1;
        } // Z X Y order
      } else {
        // x0<y0
        if (y0 < z0) {
          i1 = 0;
          j1 = 0;
          k1 = 1;
          i2 = 0;
          j2 = 1;
          k2 = 1;
        } // Z Y X order
        else if (x0 < z0) {
          i1 = 0;
          j1 = 1;
          k1 = 0;
          i2 = 0;
          j2 = 1;
          k2 = 1;
        } // Y Z X order
        else {
          i1 = 0;
          j1 = 1;
          k1 = 0;
          i2 = 1;
          j2 = 1;
          k2 = 0;
        } // Y X Z order
      }
      // A step of (1,0,0) in (i,j,k) means a step of (1-c,-c,-c) in (x,y,z),
      // a step of (0,1,0) in (i,j,k) means a step of (-c,1-c,-c) in (x,y,z), and
      // a step of (0,0,1) in (i,j,k) means a step of (-c,-c,1-c) in (x,y,z), where
      // c = 1/6.
      var x1 = x0 - i1 + G3; // Offsets for second corner in (x,y,z) coords
      var y1 = y0 - j1 + G3;
      var z1 = z0 - k1 + G3;
      var x2 = x0 - i2 + 2.0 * G3; // Offsets for third corner in (x,y,z) coords
      var y2 = y0 - j2 + 2.0 * G3;
      var z2 = z0 - k2 + 2.0 * G3;
      var x3 = x0 - 1.0 + 3.0 * G3; // Offsets for last corner in (x,y,z) coords
      var y3 = y0 - 1.0 + 3.0 * G3;
      var z3 = z0 - 1.0 + 3.0 * G3;
      // Work out the hashed gradient indices of the four simplex corners
      var ii = i & 255;
      var jj = j & 255;
      var kk = k & 255;
      var gi0 = this.perm[ii + this.perm[jj + this.perm[kk]]] % 12;
      var gi1 =
        this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] % 12;
      var gi2 =
        this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] % 12;
      var gi3 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] % 12;
      // Calculate the contribution from the four corners
      var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 < 0) n0 = 0.0;
      else {
        t0 *= t0;
        n0 = t0 * t0 * this.dot(this.grad3[gi0], x0, y0, z0);
      }
      var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 < 0) n1 = 0.0;
      else {
        t1 *= t1;
        n1 = t1 * t1 * this.dot(this.grad3[gi1], x1, y1, z1);
      }
      var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t2 < 0) n2 = 0.0;
      else {
        t2 *= t2;
        n2 = t2 * t2 * this.dot(this.grad3[gi2], x2, y2, z2);
      }
      var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 < 0) n3 = 0.0;
      else {
        t3 *= t3;
        n3 = t3 * t3 * this.dot(this.grad3[gi3], x3, y3, z3);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to stay just inside [-1,1]
      return 32.0 * (n0 + n1 + n2 + n3);
    };

    // Classic Perlin noise, 3D version
    //----------------------------------------------------------------------------//
    var ClassicalNoise = function (r) {
      if (r == undefined) r = Math;
      this.grad3 = [
        [1, 1, 0],
        [-1, 1, 0],
        [1, -1, 0],
        [-1, -1, 0],
        [1, 0, 1],
        [-1, 0, 1],
        [1, 0, -1],
        [-1, 0, -1],
        [0, 1, 1],
        [0, -1, 1],
        [0, 1, -1],
        [0, -1, -1],
      ];
      this.p = [];
      for (var i = 0; i < 256; i++) {
        this.p[i] = Math.floor(r.random() * 256);
      }
      // To remove the need for index wrapping, double the permutation table length
      this.perm = [];
      for (var j = 0; j < 512; j++) {
        this.perm[j] = this.p[j & 255];
      }
    };

    ClassicalNoise.prototype.dot = function (g, x, y, z) {
      return g[0] * x + g[1] * y + g[2] * z;
    };

    ClassicalNoise.prototype.mix = function (a, b, t) {
      return (1.0 - t) * a + t * b;
    };

    ClassicalNoise.prototype.fade = function (t) {
      return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    };

    ClassicalNoise.prototype.noise = function (x, y, z) {
      // Find unit grid cell containing point
      var X = Math.floor(x);
      var Y = Math.floor(y);
      var Z = Math.floor(z);

      // Get relative xyz coordinates of point within that cell
      x = x - X;
      y = y - Y;
      z = z - Z;

      // Wrap the integer cells at 255 (smaller integer period can be introduced here)
      X = X & 255;
      Y = Y & 255;
      Z = Z & 255;

      // Calculate a set of eight hashed gradient indices
      var gi000 = this.perm[X + this.perm[Y + this.perm[Z]]] % 12;
      var gi001 = this.perm[X + this.perm[Y + this.perm[Z + 1]]] % 12;
      var gi010 = this.perm[X + this.perm[Y + 1 + this.perm[Z]]] % 12;
      var gi011 = this.perm[X + this.perm[Y + 1 + this.perm[Z + 1]]] % 12;
      var gi100 = this.perm[X + 1 + this.perm[Y + this.perm[Z]]] % 12;
      var gi101 = this.perm[X + 1 + this.perm[Y + this.perm[Z + 1]]] % 12;
      var gi110 = this.perm[X + 1 + this.perm[Y + 1 + this.perm[Z]]] % 12;
      var gi111 = this.perm[X + 1 + this.perm[Y + 1 + this.perm[Z + 1]]] % 12;

      // The gradients of each corner are now:
      // g000 = grad3[gi000];
      // g001 = grad3[gi001];
      // g010 = grad3[gi010];
      // g011 = grad3[gi011];
      // g100 = grad3[gi100];
      // g101 = grad3[gi101];
      // g110 = grad3[gi110];
      // g111 = grad3[gi111];
      // Calculate noise contributions from each of the eight corners
      var n000 = this.dot(this.grad3[gi000], x, y, z);
      var n100 = this.dot(this.grad3[gi100], x - 1, y, z);
      var n010 = this.dot(this.grad3[gi010], x, y - 1, z);
      var n110 = this.dot(this.grad3[gi110], x - 1, y - 1, z);
      var n001 = this.dot(this.grad3[gi001], x, y, z - 1);
      var n101 = this.dot(this.grad3[gi101], x - 1, y, z - 1);
      var n011 = this.dot(this.grad3[gi011], x, y - 1, z - 1);
      var n111 = this.dot(this.grad3[gi111], x - 1, y - 1, z - 1);
      // Compute the fade curve value for each of x, y, z
      var u = this.fade(x);
      var v = this.fade(y);
      var w = this.fade(z);
      // Interpolate along x the contributions from each of the corners
      var nx00 = this.mix(n000, n100, u);
      var nx01 = this.mix(n001, n101, u);
      var nx10 = this.mix(n010, n110, u);
      var nx11 = this.mix(n011, n111, u);
      // Interpolate the four results along y
      var nxy0 = this.mix(nx00, nx10, v);
      var nxy1 = this.mix(nx01, nx11, v);
      // Interpolate the two last results along z
      var nxyz = this.mix(nxy0, nxy1, w);

      return nxyz;
    };

    //----------------------------------------------------------------------------//
    var rand = {};
    rand.random = new Alea(seed);
    var noise = new ClassicalNoise(rand);

    this.noise = function (x, y, z) {
      return 0.5 * noise.noise(x, y, z) + 0.5;
    };
  }
}
class Location {
  constructor(X, Y) {
    this.X = X;
    this.Y = Y;
  }
}
import * as d3 from "d3";
export default {
  data() {
    return {
      SWITCH: false,
      SWITCH2: false,
      SEED: 1,
      WIDTH: 512,
      HEIGHT: 512,
      MAX_GRID: 32,
      MAX_NUMBER: 30,
      GRID: [],
      svg: {},
      SCORE: 0,
      SCHEMAS: {
        BrBG: d3.interpolateBrBG,
        PRGn: d3.interpolatePRGn,
        PiYG: d3.interpolatePiYG,
        PuOr: d3.interpolatePuOr,
        RdBu: d3.interpolateRdBu,
        RdGy: d3.interpolateRdGy,
        RdYlBu: d3.interpolateRdYlBu,
        RdYlGn: d3.interpolateRdYlGn,
        Spectral: d3.interpolateSpectral,
        Blues: d3.interpolateBlues,
        Greens: d3.interpolateGreens,
        Greys: d3.interpolateGreys,
        Oranges: d3.interpolateOranges,
        Purples: d3.interpolatePurples,
        Reds: d3.interpolateReds,
        Turbo: d3.interpolateTurbo,
        Viridis: d3.interpolateViridis,
        Inferno: d3.interpolateInferno,
        Magma: d3.interpolateMagma,
        Plasma: d3.interpolatePlasma,
        Cividis: d3.interpolateCividis,
        Warm: d3.interpolateWarm,
        Cool: d3.interpolateCool,
        CubehelixDefault: d3.interpolateCubehelixDefault,
        BuGn: d3.interpolateBuGn,
        BuPu: d3.interpolateBuPu,
        GnBu: d3.interpolateGnBu,
        OrRd: d3.interpolateOrRd,
        PuBuGn: d3.interpolatePuBuGn,
        PuBu: d3.interpolatePuBu,
        PuRd: d3.interpolatePuRd,
        RdPu: d3.interpolateRdPu,
        YlGnBu: d3.interpolateYlGnBu,
        YlGn: d3.interpolateYlGn,
        YlOrBr: d3.interpolateYlOrBr,
        YlOrRd: d3.interpolateYlOrRd,
        Rainbow: d3.interpolateRainbow,
        Sinebow: d3.interpolateSinebow,
      },
      SELECTED_SCHEMA: "Inferno",
    };
  },
  methods: {
    ReRender() {
      this.GenerateGrid();
      this.RenderGrid(this.GRID);
    },
    GetColour(input) {
      const myColor = d3
        .scaleSequential()
        //.interpolator(d3.interpolateInferno)
        .interpolator(this.SCHEMAS[this.SELECTED_SCHEMA])
        .domain([this.MAX_NUMBER + 1, 0]);
      const returnValue = myColor(input);
      return returnValue;
    },
    ComputeHScore(x_1, y_1, x_2, y_2) {
      return Math.abs(x_2 - x_1) + Math.abs(y_2 - y_1);
    },
    getKey(obj) {
      return (obj.X + this.MAX_GRID * obj.Y).toString();
    },
    GetWalkableAjacentSquares(x, y) {
      let proposedLocations = [];
      if (x > 0) {
        proposedLocations.push(new Location(x - 1, y));
      }
      if (x < this.MAX_GRID - 1) {
        proposedLocations.push(new Location(x + 1, y));
      }
      if (y > 0) {
        proposedLocations.push(new Location(x, y - 1));
      }
      if (y < this.MAX_GRID - 1) {
        proposedLocations.push(new Location(x, y + 1));
      }
      return proposedLocations;
    },
    GenerateGrid() {
      const pn = new Perlin(this.SEED);
      for (let y = 0; y < this.MAX_GRID; y++) {
        let tempArray = [];
        for (let x = 0; x < this.MAX_GRID; x++) {
          //const tempVal = Math.floor(Math.random() * this.MAX_NUMBER + 1);
          let tempVal = parseInt(pn.noise(x / 4, y / 4, 0) * this.MAX_NUMBER);
          if (this.SWITCH) {
            tempVal = tempVal - this.MAX_NUMBER / 2;
            if (tempVal < 0) {
              tempVal = this.MAX_NUMBER + tempVal;
            }
          }
          tempArray.push({
            val: tempVal,
            x: x,
            y: y,
            rgb: this.GetColour(tempVal), //myColor(tempVal)
          });
        }
        this.GRID[y] = tempArray;
      }
      this.GRID[0][0].val = 1;
      this.GRID[0][0].rgb = this.GetColour(1);
      this.GRID[this.MAX_GRID - 1][this.MAX_GRID - 1].val = 1;
      this.GRID[this.MAX_GRID - 1][this.MAX_GRID - 1].rgb = this.GetColour(1);
    },
    async CalculateBestPath() {
      const start = new Location(0, 0);
      start.G = 0;
      start.F = 0;
      start.H = 0;
      start.Parent = -1;
      const target = new Location(this.MAX_GRID - 1, this.MAX_GRID - 1);
      const targetKey = this.getKey(target);
      let openList = {};
      let closedList = {};
      openList["0"] = start;
      let smallestVal = 0;
      let smallestValIndex = 0;
      while (Object.keys(openList).length > 0 /*&& counter < 3*/) {
        smallestVal = this.MAX_GRID * this.MAX_GRID * 10;
        smallestValIndex = 0;
        let index = 0;
        for (index in openList) {
          if (openList[index].F < smallestVal) {
            smallestVal = openList[index].F;
            smallestValIndex = index;
          }
        }
        let removed = openList[smallestValIndex];

        //openList.delete(smallestValIndex)
        delete openList[smallestValIndex];
        const tempKey = this.getKey(removed);
        if (targetKey in closedList) {
          let finisher = closedList[targetKey];
          this.SCORE = finisher.G;
          let goOn = true;
          let sendOff = [];
          sendOff.push(finisher);
          while (goOn) {
            finisher = closedList[finisher.Parent];
            if (finisher.Parent < 0) {
              goOn = false;
            }
            sendOff.push(finisher);
          }
          this.RenderPath(sendOff);
          break;
        }

        if (this.SWITCH2 && removed.Parent > 0) {
          let finisher = removed;
          this.SCORE = finisher.G;
          let goOn = true;
          let sendOff = [];
          sendOff.push(finisher);
          while (goOn) {
            finisher = closedList[finisher.Parent];
            if (finisher.Parent < 0) {
              goOn = false;
            }
            sendOff.push(finisher);
          }
          setTimeout(d => this.RenderPath(sendOff, d), 0)
        }

        var adjacentSquares = this.GetWalkableAjacentSquares(
          removed.X,
          removed.Y
        );
        adjacentSquares.forEach((adjecentSquare) => {
          const adjecentSquareKey = this.getKey(adjecentSquare);
          if (adjecentSquareKey in closedList) {
            //continue;
          } else if (adjecentSquareKey in openList) {
            if (
              removed.G +
                this.GRID[adjecentSquare.Y][adjecentSquare.X].val +
                openList[adjecentSquareKey].H <
              openList[adjecentSquareKey].F
            ) {
              openList[adjecentSquareKey].G =
                removed.G + this.GRID[adjecentSquare.Y][adjecentSquare.X].val;
              openList[adjecentSquareKey].F =
                openList[adjecentSquareKey].G + openList[adjecentSquareKey].H;
              openList[adjecentSquareKey].Parent = tempKey;
            }
          } else {
            adjecentSquare.G =
              removed.G + this.GRID[adjecentSquare.Y][adjecentSquare.X].val;
            adjecentSquare.H = this.ComputeHScore(
              adjecentSquare.X,
              adjecentSquare.Y,
              target.X,
              target.Y
            );
            adjecentSquare.F = adjecentSquare.G + adjecentSquare.H;
            adjecentSquare.Parent = tempKey;
            openList[adjecentSquareKey] = adjecentSquare;
          }
        });
        closedList[tempKey] = removed;
      }
    },
    DoThing(d) {
      var one = document.querySelector("#svgding");
      var rect = one.getBoundingClientRect();
      const xstart = rect.x;
      const xdif = d.x - xstart;
      const posx = Math.floor(xdif / this.BLOCK_SIZE_X);
      const ystart = rect.y;
      const ydif = d.y - ystart;
      const posy = Math.floor(ydif / this.BLOCK_SIZE_Y);
      if (this.GRID[posy][posx].val != 255) {
        this.GRID[posy][posx].val = 255;
        this.GRID[posy][posx].rgb = "#555555";
      } else {
        this.GRID[posy][posx].val = Math.floor(
          Math.random() * this.MAX_NUMBER + 1
        );
        this.GRID[posy][posx].rgb = this.GetColour(this.GRID[posy][posx].val);
      }
      this.RenderGrid(this.GRID);
    },
    async RenderGrid(data) {
      const BLOCK_SIZE_X = this.BLOCK_SIZE_X;
      const BLOCK_SIZE_Y = this.BLOCK_SIZE_Y;
      const renderGrid = (data) => {
        d3.selectAll("g").remove();
        this.svg
          .selectAll("g")
          .data(data)
          .enter()
          .append("g") //removing
          .selectAll("block")
          .data(function (d) {
            return d;
          })
          .enter()
          .append("rect")
          .attr("x", function (d) {
            //return d.x * this.BLOCK_SIZE_X;
            return d.x * BLOCK_SIZE_X;
          })
          .attr("y", function (d) {
            //return d.y * this.BLOCK_SIZE_Y;
            return d.y * BLOCK_SIZE_Y;
          })
          .attr("height", BLOCK_SIZE_Y)
          .attr("width", BLOCK_SIZE_X)
          .attr("fill", (d) => d.rgb)
          .on("click", (d) => this.DoThing(d));
        //setTimeout(d => this.CalculateBestPath(d), 0)
        this.CalculateBestPath();
        
      };
      console.log("attempting render");
      renderGrid(data);
    },
    GetLineX(d) {
      return d.X * this.BLOCK_SIZE_X + this.BLOCK_SIZE_X / 2;
    },
    GetLineY(d) {
      return d.Y * this.BLOCK_SIZE_Y + this.BLOCK_SIZE_Y / 2;
    },
    async RenderPath(data) {
      const tempBlockSize = this.BLOCK_SIZE_X;
      const renderPath = (data) => {
        this.svg.selectAll("g").selectAll("path").remove();
        this.svg.selectAll("path").remove();
        this.svg
          .selectAll("g")
          .data(data)
          .enter()
          .append("path")
          .attr("d", this.Line(data))
          .attr("fill", "none")
          .on("click", (d) => this.DoThing(d))
          //.transition(2000)
          .attr("stroke", "white")
          .attr("stroke-width", tempBlockSize / 4);
      };
      renderPath(data);
    },
  },
  mounted() {
    try {
      this.svg = d3
        .select("#div_template")
        .append("svg")
        .attr("id", "svgding")
        .attr("width", this.WIDTH)
        .attr("height", this.HEIGHT);
      this.GenerateGrid();
      this.RenderGrid(this.GRID);
    } catch (e) {
      console.log("Cannot render chart", e);
    }
  },
  computed: {
    BLOCK_SIZE_X() {
      return this.WIDTH / this.MAX_GRID;
    },
    BLOCK_SIZE_Y() {
      return this.HEIGHT / this.MAX_GRID;
    },
    Line() {
      return d3
        .line()
        .x((d) => this.GetLineX(d))
        .y((d) => this.GetLineY(d));
    },
  },
};
</script>

<style lang="scss" scoped>
.kek{
  display:flex;
  flex-direction: row;
  text-align: center;
}

.aas {
  font-size: 8rem;
}
</style>