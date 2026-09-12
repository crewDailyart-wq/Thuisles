/**
 * De huidige tijd in milliseconden.
 *
 * Staat bewust in een eigen bestandje. Zo weet React dat het om een functie
 * van buiten gaat en klaagt de compiler niet dat er tijdens het opbouwen van
 * het scherm iets onvoorspelbaars wordt aangeroepen — terwijl dit alleen in
 * knopreacties wordt gebruikt.
 */
export function nuInMs(): number {
  return Date.now();
}
