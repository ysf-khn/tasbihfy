import { createAdapterFactory, type DBAdapterDebugLogOption } from 'better-auth/adapters'
import { createServerClient } from './supabase'

interface SupabaseAdapterConfig {
  debugLogs?: DBAdapterDebugLogOption
}

export const supabaseAdapter = (config: SupabaseAdapterConfig = {}) =>
  createAdapterFactory({
    config: {
      adapterId: 'supabase',
      adapterName: 'Supabase Adapter',
      usePlural: false,
      debugLogs: config.debugLogs,
      supportsJSON: true,
      supportsDates: false,
      supportsBooleans: true,
    },

    adapter: (ctx: any) => {
      const supabase = createServerClient()

      // Helper to apply where clauses to a Supabase query
      const applyWhere = (query: any, where: any[] | undefined) => {
        if (!where) return query
        for (const condition of where) {
          const op = condition.operator || 'eq'
          if (op === 'eq') {
            query = query.eq(condition.field, condition.value)
          } else if (op === 'ne') {
            query = query.neq(condition.field, condition.value)
          } else if (op === 'gt') {
            query = query.gt(condition.field, condition.value)
          } else if (op === 'gte') {
            query = query.gte(condition.field, condition.value)
          } else if (op === 'lt') {
            query = query.lt(condition.field, condition.value)
          } else if (op === 'lte') {
            query = query.lte(condition.field, condition.value)
          } else if (op === 'in') {
            query = query.in(condition.field, condition.value)
          } else if (op === 'contains') {
            query = query.ilike(condition.field, `%${condition.value}%`)
          } else if (op === 'starts_with') {
            query = query.ilike(condition.field, `${condition.value}%`)
          } else if (op === 'ends_with') {
            query = query.ilike(condition.field, `%${condition.value}`)
          }
        }
        return query
      }

      return {
        async create({ model, data }: { model: string; data: any }) {
          const tableName = ctx.getModelName(model)
          const inputData = ctx.transformInput(data, model, 'create')

          const { data: result, error } = await (supabase.from(tableName) as any)
            .insert(inputData)
            .select()
            .single()

          if (error) throw error
          return ctx.transformOutput(result, model)
        },

        async findOne({ model, where }: { model: string; where: any }) {
          const tableName = ctx.getModelName(model)
          const whereClause = ctx.transformWhereClause(where, model)

          let query = (supabase.from(tableName) as any).select('*')
          query = applyWhere(query, whereClause)

          const { data, error } = await query.limit(1).maybeSingle()

          if (error) throw error
          if (!data) return null
          return ctx.transformOutput(data, model)
        },

        async findMany({ model, where, limit, offset, sortBy }: { model: string; where?: any; limit?: number; offset?: number; sortBy?: any }) {
          const tableName = ctx.getModelName(model)
          const whereClause = where ? ctx.transformWhereClause(where, model) : undefined

          let query = (supabase.from(tableName) as any).select('*')
          query = applyWhere(query, whereClause)

          if (sortBy) {
            query = query.order(sortBy.field, { ascending: sortBy.direction === 'asc' })
          }
          if (offset) {
            query = query.range(offset, offset + (limit || 100) - 1)
          } else if (limit) {
            query = query.limit(limit)
          }

          const { data, error } = await query

          if (error) throw error
          return (data || []).map((row: any) => ctx.transformOutput(row, model))
        },

        async update({ model, where, update: updateData }: { model: string; where: any; update: any }) {
          const tableName = ctx.getModelName(model)
          const whereClause = ctx.transformWhereClause(where, model)
          const inputData = ctx.transformInput(updateData, model, 'update')

          let query = (supabase.from(tableName) as any).update(inputData)
          query = applyWhere(query, whereClause)

          const { data, error } = await query.select().single()

          if (error) throw error
          return ctx.transformOutput(data, model)
        },

        async updateMany({ model, where, update: updateData }: { model: string; where: any; update: any }) {
          const tableName = ctx.getModelName(model)
          const whereClause = ctx.transformWhereClause(where, model)
          const inputData = ctx.transformInput(updateData, model, 'update')

          let query = (supabase.from(tableName) as any).update(inputData)
          query = applyWhere(query, whereClause)

          const { data, error } = await query.select()

          if (error) throw error
          return data?.length || 0
        },

        async delete({ model, where }: { model: string; where: any }) {
          const tableName = ctx.getModelName(model)
          const whereClause = ctx.transformWhereClause(where, model)

          let query = (supabase.from(tableName) as any).delete()
          query = applyWhere(query, whereClause)

          const { error } = await query

          if (error) throw error
        },

        async deleteMany({ model, where }: { model: string; where: any }) {
          const tableName = ctx.getModelName(model)
          const whereClause = ctx.transformWhereClause(where, model)

          let query = (supabase.from(tableName) as any).delete()
          query = applyWhere(query, whereClause)

          const { data, error } = await query.select()

          if (error) throw error
          return data?.length || 0
        },

        async count({ model, where }: { model: string; where?: any }) {
          const tableName = ctx.getModelName(model)
          const whereClause = where ? ctx.transformWhereClause(where, model) : undefined

          let query = (supabase.from(tableName) as any).select('*', { count: 'exact', head: true })
          query = applyWhere(query, whereClause)

          const { count, error } = await query

          if (error) throw error
          return count || 0
        },

        options: config,
      }
    },
  })
