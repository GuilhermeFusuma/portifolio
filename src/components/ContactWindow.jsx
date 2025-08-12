import React, { useState } from 'react';
import { Mail, Github, Linkedin, MapPin, Send, MessageCircle, Phone } from 'lucide-react';

const ContactWindow = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aqui você pode implementar o envio do formulário
    console.log('Formulário enviado:', formData);
    alert('Mensagem enviada! (Esta é uma demonstração)');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactMethods = [
    {
      icon: <Mail className="text-red-500" size={24} />,
      title: "Email",
      value: "guilherme.fusuma@email.com",
      link: "mailto:guilherme.fusuma@email.com",
      description: "Envie um email diretamente"
    },
    {
      icon: <Github className="text-gray-800" size={24} />,
      title: "GitHub",
      value: "@GuilhermeFusuma",
      link: "https://github.com/GuilhermeFusuma",
      description: "Veja meus projetos e código"
    },
    {
      icon: <Linkedin className="text-blue-600" size={24} />,
      title: "LinkedIn",
      value: "Guilherme Kenji Fusuma",
      link: "#",
      description: "Conecte-se profissionalmente"
    },
    {
      icon: <MapPin className="text-green-500" size={24} />,
      title: "Localização",
      value: "São Paulo, SP - Brasil",
      link: "#",
      description: "Disponível para oportunidades locais"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Entre em Contato</h2>
        <p className="text-gray-600">Vamos conversar sobre projetos e oportunidades!</p>
      </div>

      {/* Métodos de contato */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {contactMethods.map((method, index) => (
          <a
            key={index}
            href={method.link}
            target={method.link.startsWith('http') ? '_blank' : '_self'}
            rel="noopener noreferrer"
            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <div className="flex-shrink-0">
              {method.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                {method.title}
              </h3>
              <p className="text-sm text-gray-600 mb-1">{method.value}</p>
              <p className="text-xs text-gray-500">{method.description}</p>
            </div>
          </a>
        ))}
      </div>

      {/* Formulário de contato */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <MessageCircle className="text-blue-500" size={20} />
          <h3 className="text-lg font-semibold text-gray-800">Envie uma Mensagem</h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Seu nome"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Assunto
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Assunto da mensagem"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Sua mensagem..."
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send size={18} />
            <span>Enviar Mensagem</span>
          </button>
        </form>
      </div>

      {/* Informações adicionais */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-l-4 border-blue-500">
        <h4 className="font-semibold text-gray-800 mb-2">Disponibilidade</h4>
        <p className="text-sm text-gray-600">
          Estou sempre aberto a novas oportunidades de aprendizado e colaboração. 
          Respondo normalmente em até 24 horas!
        </p>
      </div>
    </div>
  );
};

export default ContactWindow;

