// Utilitário para processar a logo do MediLink e remover o fundo
// Esta é uma versão simplificada que apenas usa a logo original
// Para remover o fundo, seria necessário processar no navegador com @huggingface/transformers

export const getMedilinkLogo = () => {
  // Por enquanto, retorna a logo original
  // A remoção de fundo seria feita em tempo de execução se necessário
  return new URL('../assets/medilink-logo.png', import.meta.url).href;
};
