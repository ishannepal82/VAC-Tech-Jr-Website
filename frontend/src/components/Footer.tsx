import {
  Facebook,
  Instagram,
  Mail,
  MapPinned,
  PhoneIcon,
  Twitter,
} from "lucide-react";

const Footer = () => {
  return (
    // REFACTORED: Simplified padding for different screen sizes.
    // - More vertical padding on mobile (py-12)
    // - Consistent padding on larger screens.
    // - Fixed typo: "text-white," -> "text-white"
    <footer className="bg-[#192f56] text-white border-t-2 border-blue-100 px-6 py-12 md:px-12 md:py-16 lg:px-20">
      
      {/* 
        RESPONSIVE CORE:
        - On mobile (default): `flex-col` stacks the columns vertically.
        - On medium screens and up (`md:`): `flex-row` places them side-by-side.
        - `gap-10` adds space between the stacked columns on mobile.
      */}
      <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-6">

        {/* Column 1: About Us */}
        <div className="max-w-sm">
          <h2 className="text-2xl font-bold text-blue-300 mb-4">About us</h2>
          <p className="text-blue-100 text-sm">
            Your Pathway to Innovation and Success. Empowering students with
            knowledge, skills, and confidence to shape the future.
          </p>

          <div className="pt-8">
            <h2 className="text-xl font-medium text-blue-100 mb-4">Connect</h2>
            <div className="flex flex-row items-center gap-x-4">
              {/* CLEANUP: Removed stray "=" and redundant text color classes */}
              <a
                href="#"
                className="bg-black/40 text-blue-300 p-2 rounded-full shadow hover:bg-black/60 transition-colors duration-300"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="bg-black/40 text-blue-300 p-2 rounded-full shadow hover:bg-black/60 transition-colors duration-300"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="bg-black/40 text-blue-300 p-2 rounded-full shadow hover:bg-black/60 transition-colors duration-300"
              >
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h2 className="text-xl font-medium text-blue-100 mb-4">
            Quick links
          </h2>
          {/* IMPROVEMENT: Added `space-y-2` for consistent vertical spacing between links */}
          <ul className="space-y-2">
            <li>
              {/* CLEANUP: Fixed invalid classes like `text-size-3` and `white/490` */}
              <a
                href="#"
                className="text-sm text-blue-100 hover:text-white transition-colors"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-blue-100 hover:text-white transition-colors"
              >
                Service
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-blue-100 hover:text-white transition-colors"
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-sm text-blue-100 hover:text-white transition-colors"
              >
                About Us
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Resources */}
        <div>
          <h2 className="text-xl font-medium text-blue-100 mb-4">Resources</h2>
          <ul className="space-y-2">
            {/* IMPROVEMENT: Replaced non-interactive `li` with `a` tags for accessibility */}
            <li>
              <a href="#" className="text-sm text-blue-100 hover:text-white transition-colors">
                Support
              </a>
            </li>
            <li>
              <a href="#" className="text-sm text-blue-100 hover:text-white transition-colors">
                Security
              </a>
            </li>
            <li>
              <a href="#" className="text-sm text-blue-100 hover:text-white transition-colors">
                Help Center
              </a>
            </li>
            <li>
              <a href="#" className="text-sm text-blue-100 hover:text-white transition-colors">
                Terms of Use
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div>
          <h2 className="text-xl font-medium text-blue-100 mb-4">Contact</h2>
          {/* IMPROVEMENT: Used semantically correct `li` for list items and added spacing */}
          <ul className="space-y-3">
            {/* CLEANUP: Removed empty `<a>` tags */}
            <li className="flex items-start gap-x-3 text-blue-100 text-sm">
              <PhoneIcon className="text-blue-100 mt-0.5" size={18} />
              <span>025-584505</span>
            </li>
            <li className="flex items-start gap-x-3 text-blue-100 text-sm">
              <Mail className="text-blue-100 mt-0.5" size={18} />
              <span>official.vactechjr@gmail.com</span>
            </li>
            <li className="flex items-start gap-x-3 text-blue-100 text-sm">
              <MapPinned className="text-blue-100 mt-0.5" size={18} />
              <span>Aaitbare-itahari, Sunsari</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-blue-100/50 my-8" />

      {/* Bottom Bar - This was already well-structured for responsiveness! */}
      <div className="flex flex-col md:flex-row justify-between items-center text-center gap-4">
        <p className="text-sm text-blue-100/80">
          © {new Date().getFullYear()} Vac Tec Jr. All Rights Reserved.
        </p>
        <div className="flex items-center gap-6 text-sm text-blue-100/80">
          {/* CLEANUP: Fixed invalid hover color `hover:text-black-700` */}
          <a href="/terms" className="hover:text-white underline">
            Terms & Conditions
          </a>
          <a href="/privacy" className="hover:text-white underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;