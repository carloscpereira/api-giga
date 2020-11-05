export default function GerarCarteira({ operadora, tipoBeneficiario, sequencia, via = 'A' }) {
  operadora = operadora.toString().padStart(8, '0');
  tipoBeneficiario = tipoBeneficiario.toString().padStart(2, '0');
  sequencia = sequencia.toString().padStart(5, '0');

  return `${operadora}${tipoBeneficiario}${sequencia}${via}`;
}
