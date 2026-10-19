import { useEffect, useRef, useState } from 'react';
import igCleanerSource from '../../admin-tools/igCleaner.js?raw';

const bookmarklet = 'javascript:' + encodeURIComponent(igCleanerSource);

export default function InstagramPanel() {
  const linkRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // O React avisa sobre hrefs "javascript:" — definimos o atributo diretamente.
  useEffect(() => {
    linkRef.current?.setAttribute('href', bookmarklet);
  }, []);

  async function copyScript() {
    await navigator.clipboard.writeText(igCleanerSource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <div className="admin__header">
        <div>
          <h1>Instagram</h1>
          <p>Deixa de seguir e remove seguidores em massa, escolhendo pessoa a pessoa.</p>
        </div>
      </div>

      <div className="ig-tool">
        <div className="ig-tool__card">
          <h3>Como funciona</h3>
          <p>
            O Instagram não deixa outros sites mexer na tua conta, por isso a ferramenta corre dentro do
            próprio instagram.com, com a tua sessão. Nada passa por este servidor e a tua password nunca é
            pedida.
          </p>
          <ol className="ig-tool__steps">
            <li>
              Arrasta o botão <strong>IG Cleaner</strong> abaixo para a barra de favoritos do browser (só uma vez).
            </li>
            <li>Abre o instagram.com no computador, com sessão iniciada.</li>
            <li>Clica no favorito. Abre um painel com a lista de quem segues e de quem te segue, com foto e nome.</li>
            <li>
              Filtra (por exemplo, “só quem não me segue de volta”), seleciona as pessoas e carrega em{' '}
              <strong>Deixar de seguir</strong> ou <strong>Remover seguidor</strong>.
            </li>
          </ol>
          <div className="ig-tool__actions">
            <a
              ref={linkRef}
              className="btn btn-primary"
              onClick={(e) => e.preventDefault()}
              title="Arrasta-me para a barra de favoritos"
            >
              ⇱ IG Cleaner
            </a>
            <button className="btn btn-ghost" onClick={copyScript}>
              {copied ? 'Copiado ✓' : 'Copiar script'}
            </button>
          </div>
          <p className="ig-tool__hint">
            Alternativa sem favorito: no instagram.com abre a consola (F12 → Console), cola o script e carrega
            Enter. O Chrome pode pedir para escreveres <code>allow pasting</code> primeiro.
          </p>
        </div>

        <div className="ig-tool__card ig-tool__card--warn">
          <h3>Limites do Instagram</h3>
          <ul className="ig-tool__steps">
            <li>Há uma pausa aleatória entre ações (25–45 s por defeito) e uma pausa longa a cada 15.</li>
            <li>Fica abaixo de ~150 ações por dia para evitar bloqueios temporários.</li>
            <li>Se o Instagram travar as ações, o painel para sozinho. Espera algumas horas antes de continuar.</li>
            <li>Mantém o separador aberto enquanto o painel trabalha.</li>
          </ul>
        </div>
      </div>
    </>
  );
}
