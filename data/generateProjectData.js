// This file generates additional project data for dynamic/fake projects
export function generateProjectData(index) {
  const techs = [
    { name: 'Python', color: 'text-emerald-400' },
    { name: 'Unity', color: 'text-blue-400' },
    { name: 'HTML/CSS', color: 'text-orange-400' },
    { name: 'React', color: 'text-cyan-400' },
    { name: 'Rust', color: 'text-red-400' }
  ];
  const types = ['Script', 'Game', 'App', 'Bot', 'Site'];
  const tech = techs[index % techs.length];
  const type = types[index % types.length];
  return {
    title: `${tech.name} ${type} ${index + 1}`,
    subtitle: `${tech.name} Development`,
    desc: `A robust ${tech.name} project focusing on performance and scalability.`,
    stack: [tech.name, 'Git', 'CI/CD'],
    started: `Jan 202${index % 5}`,
    updated: 'Mar 2025',
    images: [
      'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605647540924-852290f6b0d5?q=80&w=600&auto=format&fit=crop'
    ][index % 5]
  };
}
