'use client'

import Link from 'next/link'
import { Shield, Github, Book, MessageCircle } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold gradient-text">SOaC Framework</span>
            </div>
            <p className="text-muted-foreground mb-4 max-w-md">
              Automate, correlate, and respond to security threats with intelligence. 
              The comprehensive Security Operations as Code framework for modern security teams.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault();
                  alert('GitHub repository coming soon! Check back later for access to the open-source code.');
                }}
              >
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#components"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Components
                </Link>
              </li>
              <li>
                <Link
                  href="#scenarios"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Use Cases
                </Link>
              </li>
              <li>
                <Link
                  href="#documentation"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="#deployment"
                  className="text-muted-foreground hover:text-primary transition-colors duration-200"
                >
                  Deployment
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('GitHub repository coming soon! Check back later for access to the open-source code and issue tracking.');
                  }}
                  className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center space-x-2"
                >
                  <Book className="h-4 w-4" />
                  <span>GitHub Issues</span>
                </a>
              </li>
              <li>
                <div className="text-muted-foreground flex items-center space-x-2">
                  <MessageCircle className="h-4 w-4" />
                  <span>Discord (Coming Soon)</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm">
              © {currentYear} SOaC Framework Team. All rights reserved.
            </p>
            <p className="text-muted-foreground text-sm mt-2 md:mt-0">
              Built with ❤️ for the security community
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
