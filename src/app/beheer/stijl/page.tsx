import { redirect } from "next/navigation";

/* /beheer/stijl (zoals de eigenaar het noemde) gaat naar de stijlkiezer in het beheer. */
export default function Pagina() {
  redirect("/admin/stijl");
}
