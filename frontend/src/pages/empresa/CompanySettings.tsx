import { Upload, Save, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyService } from "@/services/api";
import { toast } from "sonner";

export function CompanySettings() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    cnpj: "",
    logo_url: "",
    site_url: "",
  });

  const { data: companyData, isLoading } = useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const response = await companyService.getOwnCompany();
      // Como o endpoint retorna uma lista filtrada por recrutador no plano, pegamos o primeiro
      return response.data[0] || null;
    },
    onSuccess: (data) => {
      if (data) {
        setFormData({
          name: data.name || "",
          cnpj: data.cnpj || "",
          logo_url: data.logo_url || "",
          site_url: data.site_url || "",
        });
      }
    }
  });

  const mutation = useMutation({
    mutationFn: (data: any) => 
      companyData?.id 
        ? companyService.update(companyData.id, data) 
        : companyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      toast.success("Configurações salvas!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.cnpj?.[0] || "Erro ao salvar configurações.");
    }
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        // Backlog: Upload real de imagem para o S3/Storage
        setFormData({ ...formData, logo_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary px-4 py-4 md:px-8 md:py-6 shadow-sm">
        <h1 className="text-primary-foreground text-2xl font-semibold">
          Configurações da Empresa
        </h1>
        <p className="text-primary-foreground/90 text-sm mt-1">
          Gerencie as informações e preferências da sua empresa
        </p>
      </header>

      {/* Content */}
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Logo Upload */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-4 md:p-8">
              <h3 className="text-foreground text-lg font-semibold mb-6">
                Logo da Empresa
              </h3>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-32 h-32 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  {(logoPreview || formData.logo_url) ? (
                    <img
                      src={logoPreview || formData.logo_url}
                      alt="Logo preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary" />
                      <p className="text-muted-foreground text-sm mt-2 group-hover:text-primary">
                        Upload
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <div className="flex-1">
                  <p className="text-foreground font-medium mb-2">
                    Logotipo da Empresa
                  </p>
                  <p className="text-muted-foreground text-sm mb-3">
                    Faça upload do logo da sua empresa. Formatos aceitos: PNG, JPG,
                    SVG. Tamanho máximo: 2MB.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium"
                  >
                    Escolher Arquivo
                  </button>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-4 md:p-8">
              <h3 className="text-foreground text-lg font-semibold mb-6">
                Informações da Empresa
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    required
                  />
                </div>

                <div>
                  <label className="block text-foreground text-sm font-medium mb-2">
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) =>
                      setFormData({ ...formData, cnpj: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-foreground text-sm font-medium mb-2">
                    Website
                  </label>
                  <input
                    type="text"
                    value={formData.site_url}
                    onChange={(e) =>
                      setFormData({ ...formData, site_url: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-background text-foreground"
                    placeholder="https://suaempresa.com"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="px-6 py-3 text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={mutation.isLoading}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity shadow-sm flex items-center gap-2 font-medium"
              >
                {mutation.isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Salvar Alterações
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
