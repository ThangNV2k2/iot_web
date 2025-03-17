import { sqrt, sin, cos, atan2, pow } from 'mathjs';

const EARTH_RADIUS = 6378137.0;
const EARTH_ECCENTRICITY = 0.081819191;
const PI = Math.PI;

// Convert Geodetic (Lat, Lon, Alt) to ECEF (X, Y, Z)
export function geodeticToECEF(lat: number, lon: number, alt: number): [number, number, number] {
    const phi = (lat * PI) / 180;
    const lambda = (lon * PI) / 180;
    const h = alt;

    const sinPhi = Number(sin(phi));
    const cosPhi = Number(cos(phi));
    const sinLambda = Number(sin(lambda));
    const cosLambda = Number(cos(lambda));

    const N = EARTH_RADIUS / Number(sqrt(1 - Number(pow(EARTH_ECCENTRICITY, 2)) * Number(pow(sinPhi, 2))));
    const X = (N + h) * cosPhi * cosLambda;
    const Y = (N + h) * cosPhi * sinLambda;
    const Z = (N * (1 - Number(pow(EARTH_ECCENTRICITY, 2))) + h) * sinPhi;

    return [X, Y, Z];
}

// Convert ECEF to Geodetic (Lat, Lon, Alt)
export function ecefToGeodetic(X: number, Y: number, Z: number): [number, number, number] {
    const a = EARTH_RADIUS;
    const e = EARTH_ECCENTRICITY;
    const w2 = Number(pow(X, 2)) + Number(pow(Y, 2));
    const w = Number(sqrt(w2));
    const lambda = Number(atan2(Y, X));
    
    let phi = Number(atan2(Z, w * (1 - Number(pow(e, 2)))));
    let h = 0;
    let N: number;
    
    for (let i = 0; i < 5; i++) {
        N = a / Number(sqrt(1 - Number(pow(e, 2)) * Number(pow(sin(phi), 2))));
        h = w / Number(cos(phi)) - N;
        phi = Number(atan2(Z, w * (1 - Number(pow(e, 2)) * (N / (N + h)))));
    }

    return [(phi * 180) / PI, (lambda * 180) / PI, h];
}
