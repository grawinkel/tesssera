import '../styles/landing.css';
import { Hero } from './landing/Hero';
import { FlowPlayground } from './landing/FlowPlayground';
import { Features } from './landing/Features';
import { TrustPillars } from './landing/TrustPillars';
import { UseCases } from './landing/UseCases';
import { NameExplainer } from './landing/NameExplainer';
import { BottomCTA } from './landing/BottomCTA';

export function LandingPage() {
  return (
    <div className="landing">
      <Hero />
      <hr className="section-divider" />
      <FlowPlayground />
      <hr className="section-divider" />
      <Features />
      <hr className="section-divider" />
      <TrustPillars />
      <hr className="section-divider" />
      <UseCases />
      <hr className="section-divider" />
      <NameExplainer />
      <hr className="section-divider" />
      <BottomCTA />
    </div>
  );
}
