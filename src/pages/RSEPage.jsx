import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Leaf, Users, Heart, TrendingUp } from 'lucide-react';

const RSEPage = ({ language }) => {
  const translations = {
    fr: {
      title: 'Engagement RSE - Groupe SPI',
      description: 'Découvrez l\'engagement du Groupe SPI en matière de responsabilité sociétale et environnementale',
      hero: {
        title: 'Bâtir un Avenir Responsable',
        subtitle: 'Notre Engagement pour un Impact Positif'
      },
      intro: {
        title: 'Un Engagement au Cœur de Notre Stratégie',
        content: 'Pour le Groupe SPI, la performance est globale. Elle intègre la réussite économique, le progrès social et le respect de l’environnement. Notre démarche RSE est le pilier de notre croissance et le reflet de nos valeurs, guidant chacune de nos décisions.'
      },
      pillars: {
        environment: {
          title: 'Planète & Environnement',
          description: 'Minimiser notre empreinte, maximiser notre impact positif. De la construction durable à l\'agriculture régénératrice, nous innovons pour préserver notre planète.'
        },
        social: {
          title: 'Capital Humain & Communautés',
          description: 'Nos collaborateurs sont notre plus grande force. Nous investissons dans leur développement et nous engageons activement auprès de nos communautés locales.'
        },
        ethics: {
          title: 'Éthique & Gouvernance',
          description: 'La transparence et l\'intégrité sont les fondations de la confiance. Nous appliquons les plus hauts standards de gouvernance dans toutes nos opérations.'
        },
        innovation: {
          title: 'Innovation Durable',
          description: 'Nous investissons dans des solutions qui répondent aux défis de demain, en alliant innovation technologique, viabilité économique et responsabilité sociétale.'
        }
      },
      actions: {
        title: 'Nos Actions Concrètes',
        items: [
          {
            title: 'Réduction de l\'empreinte carbone',
            description: 'Objectif de neutralité carbone d\'ici 2030 à travers l\'ensemble de nos activités'
          },
          {
            title: 'Emploi local',
            description: 'Plus de 80% de nos collaborateurs sont issus des communautés locales'
          },
          {
            title: 'Formation continue',
            description: 'Programme de formation annuel pour tous nos employés'
          },
          {
            title: 'Économie circulaire',
            description: 'Valorisation et recyclage de 90% de nos déchets'
          },
          {
            title: 'Partenariats solidaires',
            description: 'Collaboration avec des associations locales pour le développement communautaire'
          },
          {
            title: 'Agriculture durable',
            description: 'Conversion de 100% de nos exploitations en agriculture biologique'
          }
        ]
      }
    },
    en: {
      title: 'CSR Commitment - SPI Group',
      description: 'Discover SPI Group\'s commitment to social and environmental responsibility',
      hero: {
        title: 'Building a Responsible Future',
        subtitle: 'Our Commitment to a Positive Impact'
      },
      intro: {
        title: 'A Commitment at the Heart of Our Strategy',
        content: 'For SPI Group, performance is global. It integrates economic success, social progress, and environmental respect. Our CSR approach is the pillar of our growth and a reflection of our values, guiding each of our decisions.'
      },
      pillars: {
        environment: {
          title: 'Planet & Environment',
          description: 'Minimizing our footprint, maximizing our positive impact. From sustainable construction to regenerative agriculture, we innovate to preserve our planet.'
        },
        social: {
          title: 'Human Capital & Communities',
          description: 'Our employees are our greatest strength. We invest in their development and actively engage with our local communities.'
        },
        ethics: {
          title: 'Ethics & Governance',
          description: 'Transparency and integrity are the foundations of trust. We apply the highest governance standards in all our operations.'
        },
        innovation: {
          title: 'Sustainable Innovation',
          description: 'We invest in solutions that meet tomorrow\'s challenges, combining technological innovation, economic viability, and social responsibility.'
        }
      },
      actions: {
        title: 'Our Concrete Actions',
        items: [
          {
            title: 'Carbon footprint reduction',
            description: 'Carbon neutrality target by 2030 across all our activities'
          },
          {
            title: 'Local employment',
            description: 'More than 80% of our employees come from local communities'
          },
          {
            title: 'Continuous training',
            description: 'Annual training program for all our employees'
          },
          {
            title: 'Circular economy',
            description: 'Recovery and recycling of 90% of our waste'
          },
          {
            title: 'Solidarity partnerships',
            description: 'Collaboration with local associations for community development'
          },
          {
            title: 'Sustainable agriculture',
            description: 'Conversion of 100% of our farms to organic agriculture'
          }
        ]
      }
    }
  };

  const t = translations[language];

  const pillars = [
    { icon: Leaf, title: t.pillars.environment.title, description: t.pillars.environment.description, color: 'text-green-600' },
    { icon: Users, title: t.pillars.social.title, description: t.pillars.social.description, color: 'text-blue-600' },
    { icon: Heart, title: t.pillars.ethics.title, description: t.pillars.ethics.description, color: 'text-pink-600' },
    { icon: TrendingUp, title: t.pillars.innovation.title, description: t.pillars.innovation.description, color: 'text-purple-600' }
  ];

  return (
    <>
      <Helmet>
        <title>{t.title}</title>
        <meta name="description" content={t.description} />
      </Helmet>

      <section className="hero-gradient py-20">
        <div className="container-custom text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-blue-900 mb-4">
              {t.hero.title}
            </h1>
            <p className="text-2xl secondary-accent">
              {t.hero.subtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto mb-20"
          >
            <h2 className="text-4xl font-bold text-blue-900 mb-6">
              {t.intro.title}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {t.intro.content}
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 mb-20">
            {pillars.map((pillar, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gray-50 rounded-xl p-8 card-hover"
              >
                <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-6 shadow-md">
                  <pillar.icon className={`h-8 w-8 ${pillar.color}`} />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">
                  {pillar.title}
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
              {t.actions.title}
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.actions.items.map((action, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-900"
              >
                <h3 className="text-xl font-bold text-blue-900 mb-3">
                  {action.title}
                </h3>
                <p className="text-gray-600">
                  {action.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img alt="Engagement RSE du Groupe SPI" className="rounded-2xl shadow-xl" src="https://images.unsplash.com/photo-1691109972364-0f3b7ce93527" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="bg-green-50 rounded-xl p-8">
                <div className="text-5xl font-bold text-green-600 mb-2">2030</div>
                <p className="text-lg text-gray-700">{language === 'fr' ? 'Objectif neutralité carbone' : 'Carbon neutrality target'}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-8">
                <div className="text-5xl font-bold text-blue-600 mb-2">80%</div>
                <p className="text-lg text-gray-700">{language === 'fr' ? 'Emploi local' : 'Local employment'}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-8">
                <div className="text-5xl font-bold text-amber-600 mb-2">100%</div>
                <p className="text-lg text-gray-700">{language === 'fr' ? 'Agriculture biologique' : 'Organic agriculture'}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default RSEPage;