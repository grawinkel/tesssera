import { useScrollReveal } from './useScrollReveal';

export function NameExplainer() {
  const { ref, visible } = useScrollReveal();

  return (
    <section className={`landing-section reveal ${visible ? 'visible' : ''}`} ref={ref}>
      <h2>Why &ldquo;TESSSERA&rdquo;?</h2>
      <p>
        In ancient Rome, a{' '}
        <a
          href="https://en.wikipedia.org/wiki/Tessera"
          target="_blank"
          rel="noopener noreferrer"
        >
          tessera hospitalis
        </a>{' '}
        was a token broken between host and guest &mdash; reuniting the pieces
        proved a bond of trust across generations. The triple S stands for{' '}
        <a
          href="https://en.wikipedia.org/wiki/Shamir%27s_secret_sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          <strong>S</strong>hamir&apos;s <strong>S</strong>ecret{' '}
          <strong>S</strong>haring
        </a>
        , the cryptographic scheme that powers the tool. Ancient trust ritual
        meets modern mathematics.
      </p>
    </section>
  );
}
