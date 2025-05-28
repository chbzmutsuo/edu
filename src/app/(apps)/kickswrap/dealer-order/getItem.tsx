'use server'
export const getItems = async spreadApiPath => {
  const res = await fetch(spreadApiPath, {
    method: 'POST',
    body: JSON.stringify({action: `getItemData`}),
  }).then(res => {
    return res.json()
  })

  const {items, users} = res.result

  return {items, users}
}
