import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import D3OnionChart from '@/components/OnionChart'
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from '@/hooks/use-toast';
import { Wand2 } from "lucide-react";
import { getDesignSuggestion } from "./lib/gemini";
import { Toaster } from "./components/ui/toaster";


interface OnionLayer {
  name: string;
  description: string;
  components: string[];
}

const mokeDesignData: Record<string, OnionLayer> = {
  "core": {
    "name": "Core Business Logic",
    "description": "This layer contains the core business logic of the delivery app, including the algorithms for order processing, delivery route optimization, and inventory management.",
    "components": [
      "Order Processing",
      "Delivery Route Optimization",
      "Inventory Management",
      "Pricing Engine"
    ]
  },
  "application": {
    "name": "Application Services",
    "description": "This layer contains the services that interact with the core business logic to fulfill business requirements. It includes user management, notification services, and order tracking.",
    "components": [
      "User Management",
      "Notification Service",
      "Order Tracking",
      "Payment Gateway Integration",
      "Location Services"
    ]
  },
  "infrastructure": {
    "name": "Infrastructure Layer",
    "description": "This layer focuses on the persistence and communication layers. It handles data storage, external APIs, and system integration.",
    "components": [
      "Database (SQL/NoSQL)",
      "External API Integrations",
      "Caching Systems",
      "Authentication/Authorization",
      "File Storage"
    ]
  },
  "interface": {
    "name": "User Interface (UI)",
    "description": "This layer includes all the user-facing components, such as mobile app interfaces, website, and customer support tools.",
    "components": [
      "Mobile App (iOS/Android)",
      "Web Application",
      "Admin Dashboard",
      "Customer Support Chat",
      "Order Confirmation Pages"
    ]
  },
  "external": {
    "name": "External Systems",
    "description": "This layer involves external integrations and third-party services that interact with the delivery app, such as external payment gateways, maps, and delivery tracking.",
    "components": [
      "Payment Gateways",
      "Map and Geolocation Services",
      "SMS and Email Service Providers",
      "Third-party Delivery Services"
    ]
  }
}

export default function App() {
  const [selectedLayer, setSelectedLayer] = useState<string | null>(null)

  const [projectIdea, setProjectIdea] = useState('');
  const [onionDesign, setOnionDesign] = useState<Record<string, OnionLayer> | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);


  const { toast } = useToast();


  const handleGenerate = async () => {

    setIsGenerating(true);

    try {
      const design = await getDesignSuggestion(projectIdea);

      setOnionDesign(design);

      setIsGenerating(false);

      toast({
        title: 'Success!',
        description: 'Onion Design generated successfully',
      });

    } catch (error) {
      console.error("Error generating design:", error);
      toast({
        title: 'Error',
        description: 'Failed to generate Onion Design.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Project Design Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input
              placeholder="Enter your project idea"
              value={projectIdea}
              onChange={(e) => setProjectIdea(e.target.value)}
              className="w-full"
            />
            <Button
              onClick={handleGenerate}
              disabled={!projectIdea || isGenerating}
              className="w-full"
              size="lg"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate Design"}
            </Button>

            {onionDesign && !isGenerating && (

              <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                  <D3OnionChart data={onionDesign} onLayerSelect={setSelectedLayer} />
                </div>
                <div className="flex-1">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="details">Layer Details</TabsTrigger>
                      <TabsTrigger value="json">JSON Data</TabsTrigger>
                    </TabsList>
                    <TabsContent value="details">
                      {selectedLayer ? (
                        <div className="mt-4">
                          <h3 className="text-xl font-semibold mb-2">{mokeDesignData[selectedLayer].name}</h3>
                          <p className="text-sm text-gray-600 mb-4">{mokeDesignData[selectedLayer].description}</p>
                          <h4 className="text-lg font-semibold mb-2">Components:</h4>
                          <ul className="list-disc list-inside">
                            {mokeDesignData[selectedLayer].components.map((component, index) => (
                              <li key={index} className="text-sm mb-1">{component}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600 mt-4">Select a layer to view details</p>
                      )}
                    </TabsContent>
                    <TabsContent className='w-full  overflow-scroll' value="json">
                      <div className="mt-4">
                        <p className="bg-gray-100 p-4 rounded-md text-xs">
                          {JSON.stringify(mokeDesignData, null, 2)}
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>
      <Toaster />
    </div>
  )
}

