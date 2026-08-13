import Hero from "./Components/hero";
import Navbar from "./Components/navbar";
import About from "./Components/about"; 
import Services from "./Components/services";
import CookiePopup from "./Components/cookies";
import Features from "./Components/features";
import CTA from "./Components/cta";
import Footer from "./Components/footer";

const Home = () => {
  return (
    <>
    <Navbar/>
    <Hero/>
    <CookiePopup/>
    <About/>
    <Services/>
    <Features/>
    <CTA/>
    <Footer/>
  </>
  );
};

export default Home;