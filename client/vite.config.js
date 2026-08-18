import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Em desenvolvimento local usa `vercel dev` na raiz do projeto — ele arranca
// o Vite e as funções /api juntos na mesma porta (sem precisar de proxy).
export default defineConfig({
  plugins: [react()],
});
