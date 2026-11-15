import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import {
  Shield,
  Eye,
  Lock,
  Target,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageTransition from '@/components/shared/PageTransition';
import Badge from '@/components/ui/Badge';

export const AboutPage: React.FC = () => {
  const values = [
    {
      icon: Eye,
      title: 'Radical Transparency',
      description:
        'We believe in explainable security. We never hide behind mysterious black-box scores; every risk point is mathematically transparent and remediable.',
      color: '#A3FF6F',
    },
    {
      icon: Lock,
      title: 'Uncompromising Privacy',
      description:
        'Zero-knowledge queries, k-anonymity hashing, and strict zero-log storage ensure your surveillance lookups can never be weaponized or leaked.',
      color: '#45D6FF',
    },
    {
      icon: Target,
      title: 'Actionable Precision',
      description:
        'We eliminate noisy alert fatigue. Instead of endless low-value alerts, we deliver high-fidelity, verified exposures with step-by-step remediation.',
      color: '#8B7CFF',
    },
    {
      icon: Shield,
      title: 'Defensive Integrity',
      description:
        'Our tools exist solely to defend individuals and organizations from credential exploitation, identity theft, and corporate attack surface compromise.',
      color: '#FFB547',
    },
  ];

  const teamMembers = [
    {
      name: 'Elena Rostova',
      role: 'Founder & Chief Executive Officer',
      bio: 'Former offensive security researcher and enterprise CISO with 15+ years defending critical infrastructure.',
      initials: 'ER',
    },
    {
      name: 'Dr. Marcus Vance',
      role: 'Chief Technology Officer',
      bio: 'PhD in Cryptography from MIT. Specializes in zero-knowledge database querying and homomorphic hashing.',
      initials: 'MV',
    },
    {
      name: 'Sarah Chen',
      role: 'Head of Threat Intelligence',
      bio: 'Veteran OSINT investigator and former darkweb intelligence lead at major cybersecurity syndicates.',
      initials: 'SC',
    },
    {
      name: 'Devon Patel',
      role: 'VP of Engineering',
      bio: 'Distributed systems architect with deep expertise scaling high-throughput indexing across billions of records.',
      initials: 'DP',
    },
  ];

  return (
    <PageTransition>
      <Helmet>
        <title>About Us — LeakLens Cybersecurity Mission</title>
        <meta
          name="description"
          content="Learn about LeakLens, our mission to democratize digital footprint intelligence, our privacy-first values, and the team building our defense platform."
        />
      </Helmet>

      <Navbar />

      <main className="pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-24">
        {/* Mission Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-6">
          <Badge variant="success">Our Purpose</Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-[#F5F7FA] tracking-tight">
            Democratizing <span className="gradient-green">Exposure Intelligence</span>
          </h1>
          <p className="text-lg sm:text-xl text-[#929BAD] leading-relaxed">
            In an era where personal data and corporate assets are constantly leaked across open
            and underground networks, defensive intelligence shouldn’t be an expensive mystery.
            LeakLens puts control back in your hands.
          </p>
        </section>

        {/* Narrative / Mission Card */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass p-8 sm:p-14 rounded-3xl border border-white/[0.08] relative overflow-hidden"
          >
            <div className="max-w-4xl mx-auto space-y-6 text-[#929BAD] text-base sm:text-lg leading-relaxed">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA]">
                Built by Defenders, for Defenders
              </h2>
              <p>
                LeakLens was conceived with a straightforward realization: the vast majority of
                breaches occur not through zero-day vulnerabilities, but through reused passwords,
                unmonitored digital shadows, orphaned developer accounts, and misconfigured domain
                records.
              </p>
              <p>
                Traditional enterprise threat intelligence tools are either cost-prohibitive or
                overwhelmingly complex. We engineered a platform that unites lightning-fast
                indexing, cryptographic zero-knowledge privacy, and actionable explainability so that
                anyone can proactively discover and eliminate their attack surface before adversaries
                strike.
              </p>
            </div>
          </motion.div>
        </section>

        {/* Core Values */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F7FA]">
              Our Guiding Principles
            </h2>
            <p className="text-sm text-[#929BAD]">
              How we approach security, privacy, and product design every single day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={val.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="glass p-6 rounded-2xl border border-white/[0.08] flex flex-col justify-between"
                >
                  <div>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                      style={{
                        backgroundColor: `${val.color}15`,
                        border: `1px solid ${val.color}35`,
                        color: val.color,
                      }}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#F5F7FA] mb-2">{val.title}</h3>
                    <p className="text-xs sm:text-sm text-[#929BAD] leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Leadership Team (Silhouettes / Minimalist Avatars) */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#F5F7FA]">
              Leadership &amp; Research
            </h2>
            <p className="text-sm text-[#929BAD]">
              Pioneers in cryptography, offensive defense, and data protection.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, idx) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="glass p-6 rounded-2xl border border-white/[0.08] text-center space-y-4"
              >
                {/* Silhouette avatar placeholder with glowing accent */}
                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-[#111827] to-[#1F2937] border-2 border-white/[0.1] flex items-center justify-center relative overflow-hidden group">
                  <div className="w-16 h-16 rounded-full bg-white/[0.05] flex items-center justify-center text-xl font-bold text-[#A3FF6F]">
                    {member.initials}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#A3FF6F]/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#F5F7FA]">{member.name}</h3>
                  <div className="text-xs text-[#A3FF6F] font-medium mt-0.5">{member.role}</div>
                </div>

                <p className="text-xs text-[#929BAD] leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA section */}
        <section className="text-center py-10 space-y-6">
          <h2 className="text-3xl font-bold text-[#F5F7FA]">
            Join our mission for a safer internet
          </h2>
          <div className="flex justify-center gap-4">
            <Link to="/auth/signup" className="btn-primary text-base px-8 py-3.5">
              Start Free Assessment
            </Link>
            <Link to="/contact" className="btn-secondary text-base px-8 py-3.5">
              Contact Our Team
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </PageTransition>
  );
};

export default AboutPage;
