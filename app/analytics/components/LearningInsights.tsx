'use client';

import React from 'react';
import { Book, Clock, Award, Users, ArrowUpRight } from 'lucide-react';

interface InsightCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  trend?: number;
  color?: string;
}

// Insight card component with sophisticated styling
const InsightCard: React.FC<InsightCardProps> = ({ 
  title, 
  value, 
  description, 
  icon: Icon,
  trend,
  color = '#4A7B61'
}) => {
  return (
    <div className="bg-white rounded-lg border border-[#E8E6E1] overflow-hidden h-full hover:shadow-md transition-shadow duration-300">
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#2C2925] text-lg font-medium">{title}</h3>
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center" 
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="h-5 w-5" style={{ color }} />
          </div>
        </div>
        
        <div className="flex flex-col">
          <div className="text-3xl font-medium text-[#2C2925] tracking-tight mb-1">{value}</div>
          <p className="text-sm text-[#706C66]">{description}</p>
          
          {trend !== undefined && (
            <div className="flex items-center mt-3 text-sm" style={{ color: trend >= 0 ? '#5E8C73' : '#8F5849' }}>
              <ArrowUpRight className={`h-3.5 w-3.5 mr-1 ${trend < 0 ? 'transform rotate-90' : ''}`} />
              <span>{Math.abs(trend)}% {trend >= 0 ? 'increase' : 'decrease'} from previous period</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Add subtle chart-like visual decoration at bottom */}
      <div className="h-2 w-full flex">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="h-full flex-1" 
            style={{ 
              backgroundColor: color,
              opacity: 0.1 + (i % 5) * 0.15 // Creates a subtle pattern
            }}
          />
        ))}
      </div>
    </div>
  );
};

// Learning patterns component
const LearningPatterns: React.FC<{ data: any }> = ({ data }) => {
  const patterns = [
    { title: 'Morning learners', value: '32%', description: 'Peak activity between 6am-10am' },
    { title: 'Weekend focus', value: '41%', description: 'Higher weekend vs weekday completions' },
    { title: 'Sequential learners', value: '76%', description: 'Complete courses in order' },
    { title: 'Mobile-first', value: '58%', description: 'Primary device is mobile' },
  ];
  
  return (
    <div className="bg-white rounded-lg border border-[#E8E6E1] p-5 h-full shadow-sm">
      <h3 className="text-[#2C2925] text-lg font-medium mb-4">Learning Patterns</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {patterns.map((pattern, index) => (
          <div key={index} className="flex items-start">
            <div className="w-2 h-2 mt-1.5 rounded-full bg-[#675C52] mr-3"></div>
            <div>
              <div className="text-[#2C2925] font-medium">{pattern.value} {pattern.title}</div>
              <div className="text-[#706C66] text-sm">{pattern.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main learning insights component
export default function LearningInsights() {
  const insightsData = {
    completionTime: { 
      value: '4.2', 
      trend: 12,
      description: 'Average weeks to complete a course'
    },
    mostActiveTopics: {
      value: 'Biblical History',
      trend: 8,
      description: 'Highest engagement category'
    },
    certifications: {
      value: 1248,
      trend: 15,
      description: 'Certificates issued this period'
    },
    discussionParticipation: {
      value: '63%',
      trend: -4,
      description: 'Students participating in discussions'
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <InsightCard 
          title="Completion Time" 
          value={insightsData.completionTime.value} 
          description={insightsData.completionTime.description}
          icon={Clock}
          trend={insightsData.completionTime.trend}
          color="#4A7B61"
        />
        <InsightCard 
          title="Popular Topic" 
          value={insightsData.mostActiveTopics.value} 
          description={insightsData.mostActiveTopics.description}
          icon={Book}
          trend={insightsData.mostActiveTopics.trend}
          color="#675C52"
        />
        <InsightCard 
          title="Certifications" 
          value={insightsData.certifications.value} 
          description={insightsData.certifications.description}
          icon={Award}
          trend={insightsData.certifications.trend}
          color="#A69374"
        />
        <InsightCard 
          title="Discussion" 
          value={insightsData.discussionParticipation.value} 
          description={insightsData.discussionParticipation.description}
          icon={Users}
          trend={insightsData.discussionParticipation.trend}
          color="#8F5849"
        />
      </div>
      
      <LearningPatterns data={{}} />
    </div>
  );
}
