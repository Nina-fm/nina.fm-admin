import { ObjectOf, Tag, TagParams } from "~~/types/supatypes"

export const useTagsStore = defineStore("tags", () => {
  const api = useApi()
  const isLoading = ref<boolean>(false)
  const { process } = useProcess({ isLoading })
  const data = ref<Tag[]>([])
  const index = ref<ObjectOf<Tag>>()

  const fetchTags = async () =>
    await process(async () => {
      const result = await api.get(`/tags`)
      data.value = result as Tag[]
      index.value = (result as Tag[]).reduce((r, a) => ({ ...r, [a.id]: a }), {})
    })

  const loadTagById = async (tagId: string | number) =>
    await process(async () => {
      const id = typeof tagId === "number" ? tagId : Number(tagId)
      const result = await api.get(`/tags`, {
        query: {
          id,
        },
      })
      index.value = { ...index.value, [tagId]: result as Tag }
    })

  const getById = async (tagId: string | number) => {
    const id = typeof tagId === "number" ? tagId : Number(tagId)
    if (!index.value?.[id]) {
      await loadTagById(id)
    }

    return index.value?.[id]
  }

  const createTag = async (tagData: TagParams) =>
    await process(
      async () => {
        const result: Tag = await api.post(`/tags`, {
          body: { data: tagData },
        })
        data.value = [...data.value, result]
        index.value = { ...index.value, [result.id]: result }
        return data
      },
      { successMsg: "Tag créé avec succès !" }
    )

  const updateTag = async (tagId: string | number, tagData: TagParams) =>
    await process(
      async () => {
        const result: Tag = await api.patch(`/tags`, {
          query: { id: tagId },
          body: { data: tagData },
        })
        data.value = [...data.value.filter((a) => a.id !== tagId), result]
        index.value = { ...index.value, [tagId]: result }
        return data
      },
      { successMsg: "Tag mis à jour avec succès !" }
    )

  const deleteTag = async (tagId: string | number) =>
    await process(
      async () => {
        const result = await api.delete(`/tags`, {
          query: { id: tagId },
        })
        return result
      },
      {
        successMsg: "Tag supprimé avec succès !",
      }
    )

  return {
    isLoading,
    data,
    index,
    fetchTags,
    createTag,
    updateTag,
    deleteTag,
    getById,
  }
})

export const useTagsStoreRefs = () => storeToRefs(useTagsStore())

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTagsStore, import.meta.hot))
}
