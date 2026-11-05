export function congelarProfundamente<T>(valor: T): T {
  if (typeof valor !== 'object' || valor === null || Object.isFrozen(valor)) return valor;

  Object.freeze(valor);
  for (const propriedade of Object.values(valor)) congelarProfundamente(propriedade);
  return valor;
}
