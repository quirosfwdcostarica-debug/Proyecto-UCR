import { TopBar } from "@/components/layout/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { CheckCircle2, Circle, Sparkles, Building2, Users, UserCircle } from "lucide-react";
import Image from "next/image";

export default function Dashboard() {
  return (
    <div className="min-h-full bg-[#f8fafc]">
      <TopBar title="Dashboard" />
      
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Welcome Card */}
          <Card className="lg:col-span-2 p-8 border-border shadow-sm flex relative overflow-hidden bg-white">
            <div className="w-2/3 pr-4 relative z-10">
              <p className="text-sm font-semibold tracking-wider text-[#0f4c81] mb-2 uppercase">Welcome back, Gabriel</p>
              <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
                Your path to graduation is <br/>
                <span className="text-[#22c55e]">75% complete.</span>
              </h1>
              <p className="text-muted-foreground mb-8 text-base leading-relaxed max-w-md">
                Keep up the great work on your Graduation Project. You have 2 pending reviews from your mentor this week.
              </p>
              <div className="flex gap-4">
                <Button className="bg-[#0f4c81] hover:bg-[#0b3a63] text-white">View Milestones</Button>
                <Button variant="outline" className="border-slate-300">Project Log</Button>
              </div>
            </div>
            {/* Image Placeholder */}
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-bl from-cyan-900 to-[#0f4c81] flex items-center justify-center opacity-90">
                <div className="text-white/50 text-sm font-medium">3D Graphic</div>
            </div>
          </Card>

          {/* Project Status */}
          <Card className="p-6 border-border shadow-sm bg-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground">Project Status</h3>
              <Badge className="bg-[#dcfce7] text-[#166534] hover:bg-[#dcfce7] border-0">ON TRACK</Badge>
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2 font-medium">
                <span className="text-slate-700">Sustainable Energy Research</span>
                <span className="text-[#0f4c81] text-lg font-bold">75%</span>
              </div>
              <Progress value={75} className="h-2.5 bg-slate-100" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-slate-400 line-through">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Literature Review</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 line-through">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm">Data Collection Phase</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700 font-medium">
                <Circle className="h-5 w-5 text-slate-300" />
                <span className="text-sm">Final Analysis & Report</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Applications */}
          <Card className="border-border shadow-sm bg-white">
            <div className="p-6 flex justify-between items-center border-b border-slate-100">
              <h3 className="text-lg font-bold text-foreground">Recent Applications</h3>
              <button className="text-sm font-semibold text-[#0f4c81]">View All</button>
            </div>
            <div className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Company</th>
                    <th className="px-6 py-3">Position</th>
                    <th className="px-6 py-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded border border-slate-200 bg-blue-50 flex items-center justify-center text-[10px] font-bold text-[#0f4c81]">TCH</div>
                      <span className="font-semibold text-foreground">TechCorp Global</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">Software Intern</td>
                    <td className="px-6 py-4 text-right">
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0">Interviewing</Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded border border-slate-200 bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-700">SST</div>
                      <span className="font-semibold text-foreground">SustainSystems</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">Data Analyst</td>
                    <td className="px-6 py-4 text-right">
                      <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-0">Under Review</Badge>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded border border-slate-200 bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-600">LBC</div>
                      <span className="font-semibold text-foreground">LibreConsult</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">Project Assistant</td>
                    <td className="px-6 py-4 text-right">
                      <Badge className="bg-red-50 text-red-700 hover:bg-red-50 border-0">Closed</Badge>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Support & Resources */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-foreground">Support & Resources</h3>
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-5 border-border shadow-sm bg-blue-50/50">
                <div className="h-10 w-10 rounded-lg bg-[#0f4c81] flex items-center justify-center text-white mb-4">
                  <Building2 className="h-5 w-5" />
                </div>
                <p className="text-sm text-slate-600 mb-1 font-medium">Scholarship Funds</p>
                <h4 className="text-2xl font-bold text-[#0f4c81] mb-2">¢450,000</h4>
                <p className="text-xs font-semibold text-green-600">+12% from last term</p>
              </Card>
              <Card className="p-5 border-border shadow-sm bg-green-50/50">
                <div className="h-10 w-10 rounded-lg bg-green-700 flex items-center justify-center text-white mb-4">
                  <Users className="h-5 w-5" />
                </div>
                <p className="text-sm text-slate-600 mb-1 font-medium">Active Mentorships</p>
                <h4 className="text-2xl font-bold text-[#0f4c81] mb-2">2 Mentors</h4>
                <p className="text-xs font-medium text-slate-500">Last sync: 2 days ago</p>
              </Card>
            </div>
            <Card className="p-5 border-dashed border-2 border-slate-300 bg-white flex items-center justify-between">
              <div className="flex gap-4 items-center">
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-[#0f4c81]" />
                </div>
                <div>
                  <h5 className="font-bold text-foreground">Career Grant Available</h5>
                  <p className="text-sm text-slate-500">Your profile qualifies for the Alumni Excellence fund.</p>
                </div>
              </div>
              <Button variant="outline" className="border-[#0f4c81] text-[#0f4c81]">Apply Now</Button>
            </Card>
          </div>
        </div>

        {/* Recommended Mentors */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h3 className="text-lg font-bold text-foreground">Recommended Mentors</h3>
            <Badge className="bg-[#0f4c81] text-white hover:bg-[#0f4c81] border-0 text-xs px-2 py-0.5">⚡ AI MATCHING</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {[
              { name: "Ing. Maria Valverde", role: "Lead Eng @ Intel CR", tags: ["Semicond.", "Leadership"], match: "98% Match" },
              { name: "Dr. Roberto Solís", role: "Principal Scientist", tags: ["BioTech", "R&D"], match: "92% Match" },
              { name: "Lic. Elena Mora", role: "Product Strategist", tags: ["Startups", "UX"], match: "85% Match" }
            ].map((mentor, i) => (
              <Card key={i} className="overflow-hidden border-border shadow-sm bg-white flex flex-col">
                <div className="h-48 bg-slate-200 relative">
                  {/* Grayscale image placeholder */}
                  <div className="absolute inset-0 bg-slate-300 grayscale flex justify-center items-end">
                     <UserCircle className="h-32 w-32 text-slate-400 mb-[-1rem]"/>
                  </div>
                  <Badge className="absolute bottom-3 right-3 bg-green-600 text-white hover:bg-green-600 border-0">{mentor.match}</Badge>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="font-bold text-base text-foreground mb-1">{mentor.name}</h4>
                  <p className="text-sm text-slate-600 mb-4">{mentor.role}</p>
                  <div className="flex gap-2 mb-6">
                    {mentor.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-medium">{tag}</span>
                    ))}
                  </div>
                  <Button className="w-full mt-auto bg-blue-50 text-[#0f4c81] hover:bg-blue-100 font-semibold border-0">Request Coffee Chat</Button>
                </div>
              </Card>
            ))}

            {/* Find More Mentors Card */}
            <Card className="overflow-hidden border-dashed border-2 border-slate-300 shadow-sm bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
              <div className="h-12 w-12 rounded-lg bg-white shadow-sm flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-[#0f4c81]" />
              </div>
              <h4 className="font-bold text-base text-[#0f4c81] mb-2">Find More Mentors</h4>
              <p className="text-sm text-slate-500 mb-6">Browse our database of 5,000+ verified alumni.</p>
              <Button className="w-full bg-[#0f4c81] hover:bg-[#0b3a63] text-white">Explore Directory</Button>
            </Card>

          </div>
        </div>

      </div>
    </div>
  );
}
