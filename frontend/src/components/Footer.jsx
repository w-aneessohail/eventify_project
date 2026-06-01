import { Link } from 'react-router-dom';
import { Mail, Facebook, Send, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Logo and Description */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary">
                <path d="M3 7H7V17H3V7Z" fill="currentColor"/>
                <path d="M9 4H13V20H9V4Z" fill="currentColor"/>
                <path d="M15 10H19V14H15V10Z" fill="currentColor"/>
                <rect x="2" y="2" width="20" height="20" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span className="text-xl font-bold">TICKETER</span>
            </div>
            <h3 className="font-semibold text-lg mb-3">Who we are?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Ticketer is a global ticketing platform for live experiences that allows anyone to create, share, 
              find and attend events that fuel their passions and enrich their lives.
            </p>
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Contact</h4>
              <p className="text-sm text-muted-foreground">Ticketercontacts@gmail.com</p>
            </div>
          </div>

          {/* TICKETER Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">TICKETER</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Help</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/concert-ticketing" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Concert Ticketing
                </Link>
              </li>
              <li>
                <Link to="/account-support" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Account Support
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Terms of Us
                </Link>
              </li>
              <li>
                <Link to="/acceptable" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Acceptable
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-border pt-12 mb-12">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-semibold mb-2">Join our mailing list to stay in the loop with our...</h3>
            <div className="flex gap-3 mt-6">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg hover:bg-accent transition-colors flex items-center space-x-2">
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            ©2024 NOT FULLTIME PVT.LTD.
          </p>
          
          <div className="flex items-center space-x-8">
            <Link to="/terms" className="text-sm text-foreground hover:text-primary transition-colors">
              Terms
            </Link>
            <Link to="/privacy" className="text-sm text-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link to="/cookies" className="text-sm text-foreground hover:text-primary transition-colors">
              Cookies
            </Link>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="#" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-accent transition-colors">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-accent transition-colors">
              <Send size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-accent transition-colors">
              <Facebook size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
