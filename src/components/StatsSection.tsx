
import { Users, FileCheck, Building, Award } from 'lucide-react';

const stats = [
  { 
    label: 'Users Worldwide', 
    value: '2M+', 
    icon: Users,
    description: 'Professionals who trust us'
  },
  { 
    label: 'Resumes Created', 
    value: '5M+', 
    icon: FileCheck,
    description: 'Tailored for job success' 
  },
  { 
    label: 'Partner Companies', 
    value: '500+', 
    icon: Building,
    description: 'Recognize our templates' 
  },
  { 
    label: 'Success Rate', 
    value: '85%', 
    icon: Award,
    description: 'Higher interview chances' 
  }
];

const StatsSection = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Trusted by Job Seekers Worldwide
          </h2>
          <p className="mt-4 text-xl text-muted-foreground">
            Our platform has helped millions of professionals advance their careers
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="bg-card rounded-xl p-8 text-center shadow-sm border hover:shadow-md transition-all"
            >
              <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-4xl font-bold text-foreground mb-2">{stat.value}</div>
              <div className="text-lg font-semibold text-foreground">{stat.label}</div>
              <p className="text-muted-foreground mt-2">{stat.description}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-20">
          <div className="bg-card rounded-xl p-8 border">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-1 md:col-span-1 flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-foreground mb-4">Our Users Work At</h3>
                <p className="text-muted-foreground">
                  FlowCreate resumes are recognized and preferred by hiring managers at top companies worldwide
                </p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {['Google', 'Microsoft', 'Amazon', 'Meta', 'Adobe', 'Apple', 'Netflix', 'Spotify', 'Tesla'].map((company) => (
                    <div key={company} className="flex items-center justify-center h-16 bg-muted rounded-md">
                      <span className="font-bold text-lg">{company}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
