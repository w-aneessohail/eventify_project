import { Link } from 'react-router-dom';
import { Mail, Facebook, Send } from 'lucide-react';
import { RoutePath } from '@/enum/routePath';

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-primary">
                <path d="M3 7H7V17H3V7Z" fill="currentColor"/>
                <path d="M9 4H13V20H9V4Z" fill="currentColor"/>
                <path d="M15 10H19V14H15V10Z" fill="currentColor"/>
                <rect x="2" y="2" width="20" height="20" stroke="currentColor" strokeWidth="1.5"/>
              </svg>
              <span className="text-xl font-bold">EVENTIFY</span>
            </div>
            <h3 className="font-semibold text-lg mb-3">Who we are?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Eventify is a Pakistan-focused ticketing platform for live experiences.
              Discover concerts, conferences, sports, and cultural events across the country.
            </p>
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Contact</h4>
              <p className="text-sm text-muted-foreground">hello@eventify.pk</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">EVENTIFY</h3>
            <ul className="space-y-2">
              <li>
                <Link to={RoutePath.ATTENDEE_ABOUT} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to={RoutePath.ATTENDEE_CONTACT} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to={RoutePath.ATTENDEE_ALL_EVENTS} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Browse Events
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Help</h3>
            <ul className="space-y-2">
              <li>
                <Link to={RoutePath.ATTENDEE_ALL_EVENTS} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Event Ticketing
                </Link>
              </li>
              <li>
                <Link to={RoutePath.ATTENDEE_CONTACT} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Account Support
                </Link>
              </li>
              <li>
                <Link to={RoutePath.ATTENDEE_MY_BOOKINGS} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  My Bookings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to={RoutePath.ATTENDEE_ABOUT} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Terms of Use
                </Link>
              </li>
              <li>
                <Link to={RoutePath.ATTENDEE_CONTACT} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Support Policy
                </Link>
              </li>
              <li>
                <Link to={RoutePath.ATTENDEE_ABOUT} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-12 mb-12">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-semibold mb-2">Stay in the loop with Eventify</h3>
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

        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © {new Date().getFullYear()} Eventify. All rights reserved.
          </p>

          <div className="flex items-center space-x-8">
            <Link to={RoutePath.ATTENDEE_ABOUT} className="text-sm text-foreground hover:text-primary transition-colors">
              Terms
            </Link>
            <Link to={RoutePath.ATTENDEE_ABOUT} className="text-sm text-foreground hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link to={RoutePath.ATTENDEE_CONTACT} className="text-sm text-foreground hover:text-primary transition-colors">
              Contact
            </Link>
          </div>

          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="#" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-accent transition-colors" aria-label="Facebook">
              <Facebook size={20} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white hover:bg-accent transition-colors" aria-label="Send">
              <Send size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
