/* Zet de vertaalregels uit `aliassen.mjs` aan; zie daar waarom. */
import { register } from "node:module";
register("./aliassen.mjs", import.meta.url);
