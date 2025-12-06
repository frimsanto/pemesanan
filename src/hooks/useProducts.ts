import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product, ProductVariant } from '@/lib/types';
import {
  getProducts as apiGetProducts,
  getProductById as apiGetProductById,
  getProductVariants as apiGetProductVariants,
  createProduct,
  updateProductApi,
  deleteProductApi,
  createVariantApi,
  updateVariantApi,
  deleteVariantApi,
} from '@/lib/api';

export function useProducts(activeOnly = true) {
  return useQuery({
    queryKey: ['products', activeOnly],
    queryFn: async (): Promise<Product[]> => {
      const data = await apiGetProducts(activeOnly);
      return data as Product[];
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<Product | null> => {
      const data = await apiGetProductById(id);
      return data as Product | null;
    },
    enabled: !!id,
  });
}

export function useProductVariants(productId: string, activeOnly = true) {
  return useQuery({
    queryKey: ['product-variants', productId, activeOnly],
    queryFn: async (): Promise<ProductVariant[]> => {
      const data = await apiGetProductVariants(productId, activeOnly);
      return data as ProductVariant[];
    },
    enabled: !!productId,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
      return createProduct(product as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: string }) => {
      return updateProductApi(id, updates as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteProductApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useCreateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variant: Omit<ProductVariant, 'id' | 'created_at'>) => {
      return createVariantApi(variant as any);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['product-variants', variables.product_id] });
    },
  });
}

export function useUpdateVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ProductVariant> & { id: string }) => {
      return updateVariantApi(id, updates as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
    },
  });
}

export function useDeleteVariant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteVariantApi(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-variants'] });
    },
  });
}
