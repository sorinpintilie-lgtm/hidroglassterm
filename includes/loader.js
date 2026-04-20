async function loadIncludes() {
  const includeTargets = document.querySelectorAll('[data-include]');

  await Promise.all(
    Array.from(includeTargets).map(async (target) => {
      const file = target.getAttribute('data-include');
      if (!file) return;

      try {
        const response = await fetch(file);
        if (!response.ok) {
          throw new Error(`Failed to load ${file}: ${response.status}`);
        }

        target.innerHTML = await response.text();
      } catch (error) {
        console.error(error);
      }
    })
  );

  document.dispatchEvent(new CustomEvent('includes:loaded'));
}

document.addEventListener('DOMContentLoaded', loadIncludes);