export async function delay(ms: number = 250) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
