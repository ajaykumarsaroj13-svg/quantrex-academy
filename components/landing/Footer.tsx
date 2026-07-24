import Link from "next/link";
import { ArrowRight, Twitter, Youtube, Instagram, Linkedin } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-[#050816] pt-24 pb-12 border-t border-white/10 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-16">
          
          {/* Brand Col */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl">
                Q
              </div>
              <span className="text-2xl font-heading font-bold text-white tracking-wide">
                Quantrex<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-text-secondary mb-8 max-w-sm">
              India's most premium Mathematics learning platform for IIT JEE. Concept Creates Destiny.
            </p>
            <div className="flex gap-4">
              <SocialLink icon={<Twitter className="w-5 h-5" />} />
              <SocialLink icon={<Youtube className="w-5 h-5" />} />
              <SocialLink icon={<Instagram className="w-5 h-5" />} />
              <SocialLink icon={<Linkedin className="w-5 h-5" />} />
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white mb-6">Platform</h4>
            <ul className="space-y-4">
              <FooterLink href="#courses">Courses</FooterLink>
              <FooterLink href="#test-series">Test Series</FooterLink>
              <FooterLink href="#ai-features">AI Analytics</FooterLink>
              <FooterLink href="#results">Success Stories</FooterLink>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6">Resources</h4>
            <ul className="space-y-4">
              <FooterLink href="#">PYQ Library</FooterLink>
              <FooterLink href="#">Formula Sheets</FooterLink>
              <FooterLink href="#">Blog</FooterLink>
              <FooterLink href="#">Free Mock Test</FooterLink>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <h4 className="font-bold text-white mb-6">Stay Updated</h4>
            <div className="relative">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
              <button className="absolute right-1.5 top-1.5 bottom-1.5 w-10 bg-primary hover:bg-primary/90 rounded-full flex items-center justify-center transition-colors">
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-sm text-text-secondary">
          <p>© {new Date().getFullYear()} Quantrex Academy. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <li>
    <Link href={href} className="text-text-secondary hover:text-white transition-colors">
      {children}
    </Link>
  </li>
);

const SocialLink = ({ icon }: { icon: React.ReactNode }) => (
  <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
    {icon}
  </a>
);
