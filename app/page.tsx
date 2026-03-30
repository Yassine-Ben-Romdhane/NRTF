import IntroWrapper from "@/components/IntroWrapper";
import Navbar       from "@/components/layout/Navbar";
import Footer       from "@/components/layout/Footer";
import Hero         from "@/components/sections/Hero";
import About        from "@/components/sections/About";
import Schedule     from "@/components/sections/Schedule";
import Activities   from "@/components/sections/Activities";
import FAQ          from "@/components/sections/FAQ";
import Speakers     from "@/components/sections/Speakers";
import Sponsors     from "@/components/sections/Sponsors";
import Register     from "@/components/sections/Register";

export default function Home() {
  return (
    <IntroWrapper>
      <main className="min-h-screen bg-nrtf-bg">
        <Navbar />
        <Hero />
        <About />
        <Schedule />
        <Activities />
        <Speakers />
        <Sponsors />
        <Register />
        <FAQ />
        <Footer />
      </main>
    </IntroWrapper>
  );
}
