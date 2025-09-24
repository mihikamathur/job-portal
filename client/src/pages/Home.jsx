import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import PolicyListing from '../components/JobListing'
import AppDownload from '../components/AppDownload'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <PolicyListing />
      <AppDownload />
      <Footer />
    </div>
  )
}

export default Home