/**
 * Het raster met tegels op het rekenscherm en de domeinschermen.
 *
 * Hoe breed, hangt af van hoeveel tegels er zijn:
 *   - 1 of 2: in het midden, niet te groot;
 *   - tot 4: op een liggend scherm alles naast elkaar, net als het startscherm;
 *   - tot 6: drie naast elkaar, en zo groot dat twee rijen zonder scrollen
 *     op een laptop of tablet passen;
 *   - meer: vier of vijf naast elkaar; dan mag het scherm scrollen.
 * Op een telefoon altijd twee naast elkaar.
 */

export function Tegelraster({ aantal, children }: { aantal: number; children: React.ReactNode }) {
  const indeling =
    aantal === 1
      ? "max-w-[min(15rem,45vw)] grid-cols-1"
      : aantal === 2
        ? "max-w-[min(30rem,80vw)] grid-cols-2"
        : aantal <= 4
          ? "max-w-[34rem] grid-cols-2 lg:max-w-[min(70rem,72vw)] lg:grid-cols-4"
          : aantal <= 6
            ? "max-w-[min(52rem,calc((100svh-16rem)*1.5+4rem))] grid-cols-2 sm:grid-cols-3 portrait:max-w-[52rem]"
            : "max-w-[74rem] grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";

  return (
    <div className="flex flex-1 items-center justify-center pb-6 pt-6 sm:pt-8">
      <ul
        className={`grid w-full gap-x-5 gap-y-9 sm:gap-x-8 sm:gap-y-10 ${indeling}`}
      >
        {children}
      </ul>
    </div>
  );
}
