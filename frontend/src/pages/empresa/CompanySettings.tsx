import { Upload, Save, Loader2, Globe, Building2, CreditCard } from "lucide-react";
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

  const { data: companyData, isLoading: isLoadingCompany } = useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const response = await companyService.getOwnCompany();
      // O backend retorna uma lista. O recrutador deve ter apenas uma empresa.
      return response.data[0] || null;
    }
  });

  // Atualiza o estado local quando os dados da empresa são carregados
  useEffect(() => {
    if (companyData) {
      setFormData({
        name: companyData.name || "",
        cnpj: companyData.cnpj || "",
        logo_url: companyData.logo_url || "",
        site_url: companyData.site_url || "",
      });
    }
  }, [companyData]);

  const mutation = useMutation({
    mutationFn: (data: typeof formData) => {
      if (companyData?.id) {
        return companyService.update(companyData.id, data);
      }
      return companyService.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company"] });
      toast.success("Informações da empresa salvas com sucesso!");
    },
    onError: (error: any) => {
      console.error("Erro ao salvar empresa:", error);
      const errorMessage = error.response?.data?.cnpj?.[0] || 
                          error.response?.data?.detail || 
                          "Erro ao salvar informações.";
      toast.error(errorMessage);
    }
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validação básica de tamanho (2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("O arquivo deve ter menos de 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        // Nota: Idealmente enviaríamos para um storage (S3), 
        // mas por enquanto mantemos a URL ou Base64 se suportado pelo backend
        setFormData({ ...formData, logo_url: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.name.trim() || !formData.cnpj.trim()) {
      toast.error("Nome e CNPJ são obrigatórios.");
      return;
    }

    mutation.mutate(formData);
  };

  if (isLoadingCompany) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground animate-pulse">Carregando informações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <header className="bg-primary/5 border-b border-border px-4 py-8 md:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-foreground text-3xl font-bold tracking-tight">
            Configurações da Empresa
          </h1>
          <p className="text-muted-foreground text-lg mt-2">
            Mantenha o perfil da sua empresa atualizado para atrair os melhores talentos.
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Logo Section */}
            <section className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <Building2 className="w-5 h-5 text-primary" />
                  <h3 className="text-foreground text-lg font-semibold">
                    Identidade Visual
                  </h3>
                </div>
                
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="relative group">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-40 h-40 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all relative overflow-hidden bg-muted/30"
                    >
                      {(logoPreview || formData.logo_url) ? (
                        <img
                          src={logoPreview || formData.logo_url}
                          alt="Logo da empresa"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2 group-hover:text-primary transition-colors" />
                          <p className="text-xs text-muted-foreground font-medium group-hover:text-primary transition-colors">
                            Upload Logo
                          </p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-bold uppercase tracking-wider">Alterar</span>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-foreground font-semibold">Logotipo da Empresa</h4>
                      <p className="text-muted-foreground text-sm leading-relaxed mt-1">
                        Esta imagem aparecerá em todas as suas vagas publicadas. 
                        Use uma imagem quadrada de alta qualidade (PNG, JPG ou SVG).
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium"
                      >
                        Trocar Imagem
                      </button>
                      {(logoPreview || formData.logo_url) && (
                        <button
                          type="button"
                          onClick={() => {
                            setLogoPreview(null);
                            setFormData({ ...formData, logo_url: "" });
                          }}
                          className="px-4 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-sm font-medium"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Form Section */}
            <section className="bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
              <div className="flex items-center gap-2 mb-8">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="text-foreground text-lg font-semibold">
                  Dados Cadastrais
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    Nome Fantasia *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background"
                    placeholder="Nome da sua empresa"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    CNPJ *
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) =>
                      setFormData({ ...formData, cnpj: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background"
                    placeholder="00.000.000/0000-00"
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    Website / LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.site_url}
                    onChange={(e) =>
                      setFormData({ ...formData, site_url: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-background"
                    placeholder="https://suaempresa.com.br"
                  />
                  <p className="text-xs text-muted-foreground">
                    Inclua o protocolo completo (ex: https://)
                  </p>
                </div>
              </div>
            </section>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground order-2 sm:order-1 mr-auto">
                * Campos obrigatórios
              </p>
              <button
                type="button"
                className="w-full sm:w-auto px-8 py-2.5 text-muted-foreground hover:text-foreground transition-colors font-medium order-3 sm:order-2"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={mutation.isLoading}
                className="w-full sm:w-auto px-8 py-2.5 bg-primary text-primary-foreground rounded-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/20 order-1 sm:order-3"
              >
                {mutation.isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
