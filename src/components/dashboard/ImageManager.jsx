import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PoleManager from "./PoleManager";

const ImageManager = () => {
  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader className="px-0">
        <CardTitle>Image Management</CardTitle>
        <CardDescription>Manage images for all website sections and poles.</CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        <Tabs defaultValue="sci-renaissance" className="w-full">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0 mb-6">
            <TabsTrigger value="sci-renaissance" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-gray-200 bg-white">SCI Renaissance</TabsTrigger>
            <TabsTrigger value="sci-espoir" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-gray-200 bg-white">Fondation SPI</TabsTrigger>
            <TabsTrigger value="nouveau-concept" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-gray-200 bg-white">Nouveau Concept</TabsTrigger>
            <TabsTrigger value="atelier-5" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-gray-200 bg-white">Atelier 5</TabsTrigger>
            <TabsTrigger value="la-manne" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-gray-200 bg-white">La Manne</TabsTrigger>
            <TabsTrigger value="spi-alim" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-gray-200 bg-white">SPI Alim</TabsTrigger>
            <TabsTrigger value="rse" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white border border-gray-200 bg-white">RSE</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sci-renaissance" className="mt-0">
            <PoleManager poleName="SCI Renaissance" tableName="sci_renaissance_content" bucketName="sci-renaissance-images" />
          </TabsContent>
          <TabsContent value="sci-espoir" className="mt-0">
            <PoleManager poleName="Fondation SPI" tableName="fondation_spi_content" bucketName="fondation-spi-images" />
          </TabsContent>
          <TabsContent value="nouveau-concept" className="mt-0">
            <PoleManager poleName="Nouveau Concept" tableName="nouveau_concept_content" bucketName="nouveau-concept-images" />
          </TabsContent>
          <TabsContent value="atelier-5" className="mt-0">
            <PoleManager poleName="Atelier 5" tableName="spi_beauty_content" bucketName="spi-beauty-images" />
          </TabsContent>
          <TabsContent value="la-manne" className="mt-0">
            <PoleManager poleName="La Manne" tableName="la_manne_content" bucketName="la-manne-images" />
          </TabsContent>
          <TabsContent value="spi-alim" className="mt-0">
            <PoleManager poleName="SPI Alim" tableName="spi_alim_content" bucketName="spi-alim-images" />
          </TabsContent>
          <TabsContent value="rse" className="mt-0">
            <PoleManager poleName="RSE" tableName="rse_content" bucketName="pole-images" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ImageManager;