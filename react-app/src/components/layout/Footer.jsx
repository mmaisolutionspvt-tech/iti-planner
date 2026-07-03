import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShieldHalved, faBus, faFileInvoice, faHeadset } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTwitter, faLinkedin, faYoutube, faGithub, faWordpress } from '@fortawesome/free-brands-svg-icons';

export default function Footer() {
  const socialLinks = [
    { icon: faFacebook, url: 'https://www.facebook.com/mohd.rahil.blogger' },
    { icon: faInstagram, url: 'https://www.instagram.com/mohdrahil101' },
    { icon: faTwitter, url: 'https://www.twitter.com/mohdrahil101' },
    { icon: faLinkedin, url: 'https://www.linkedin.com/in/mohdrahil101' },
    { icon: faYoutube, url: 'https://www.youtube.com/techdollarz' },
    { icon: faWordpress, url: 'https://www.mohdrahil.wordpress.com' },
    { icon: faGithub, url: 'https://www.github.com/mohdrahil101' },
  ];

  const trustBadges = [
    { icon: faShieldHalved, text: 'FSSAI Certified Caterers' },
    { icon: faBus, text: 'Verified Bus Partners' },
    { icon: faFileInvoice, text: 'GST Invoiced' },
    { icon: faHeadset, text: '24x7 Support' },
  ];

  return (
    <footer className="bg-[#121619] text-white">
      {/* Trust Layer */}
      <div className="border-b border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {trustBadges.map((badge, i) => (
            <div key={i} className="flex items-center gap-3 justify-center">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <FontAwesomeIcon icon={badge.icon} className="text-emerald-400" />
              </div>
              <span className="text-sm font-medium">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/files/logo.png" alt="Logo" className="h-12 w-12" />
              <div>
                <h3 className="font-display text-xl font-bold">Firstflight Travels</h3>
                <p className="text-white/60 text-sm">Plan your trip with us</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 relative pb-2">
              Quick Links
              <span className="absolute bottom-0 left-0 w-16 h-0.5 bg-white" />
            </h4>
            <ul className="space-y-2">
              {[{ to: '/register', label: 'Register' }, { to: '/about', label: 'About Us' }, { to: '/contact', label: 'Contact Us' }, { to: '#', label: 'Refund Policy' }, { to: '#', label: 'Safety Guidelines' }].map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-white/70 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold text-lg mb-4 relative pb-2">
              Connect
              <span className="absolute bottom-0 left-0 w-16 h-0.5 bg-white" />
            </h4>
            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white text-[#121619] flex items-center justify-center hover:scale-110 transition-transform duration-300"
                >
                  <FontAwesomeIcon icon={social.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-white/10 py-4 text-center">
        <p className="text-white/60 text-sm">Copyright © 2022 Firstflight Travels All Rights Reserved.</p>
        <p className="text-white/40 text-xs mt-1">Website developed by: Mohd. Rahil</p>
      </div>
    </footer>
  );
}
