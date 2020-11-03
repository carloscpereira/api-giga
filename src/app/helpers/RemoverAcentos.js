export default function RemoverAcentos(string) {
  let text = string;
  text = text.replace(new RegExp('[ÁÀÂÃ]', 'g'), 'A');
  text = text.replace(new RegExp('[áàâã]', 'g'), 'a');
  text = text.replace(new RegExp('[ÉÈÊ]', 'g'), 'E');
  text = text.replace(new RegExp('[éèê]', 'g'), 'e');
  text = text.replace(new RegExp('[ÍÌÎ]', 'g'), 'I');
  text = text.replace(new RegExp('[íìî]', 'g'), 'i');
  text = text.replace(new RegExp('[ÓÒÔÕ]', 'g'), 'O');
  text = text.replace(new RegExp('[óóôõ]', 'g'), 'o');
  text = text.replace(new RegExp('[ÚÙÛ]', 'g'), 'U');
  text = text.replace(new RegExp('[úùû]', 'g'), 'u');
  text = text.replace(new RegExp('[Ç]', 'g'), 'C');
  text = text.replace(new RegExp('[ç]', 'g'), 'c');
  return text;
}
