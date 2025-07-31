import "./style.css";
import { Network, DataSet } from "vis-network/standalone/esm/vis-network.js";
import type {
  Node,
  Edge,
  Options,
  IdType,
} from "vis-network/standalone/esm/vis-network.js";

interface TreeNode extends Node {
  category?: string;
  name?: string;
  level?: number;
  parentId?: IdType;
}

const nodes = new DataSet<TreeNode, "id">([]);
const edges = new DataSet<Edge>([]);

let nodeIdCounter: number = 1;
let maxLevel: number = 0;

const container = document.getElementById("graph-container") as HTMLDivElement;

const data = {
  nodes: nodes,
  edges: edges,
};

const options: Options = {
  nodes: {
    shape: "box",
    size: 30,
    font: {
      size: 16,
      color: "#ffffff",
      face: "Segoe UI, Arial, sans-serif",
      strokeWidth: 1,
      strokeColor: "#000000",
    },
    borderWidth: 3,
    shadow: {
      enabled: true,
      color: "rgba(0,0,0,0.3)",
      size: 5,
      x: 2,
      y: 2,
    },
  },
  edges: {
    width: 2,
    color: {
      color: "#848484",
      highlight: "#646cff",
    },
    arrows: {
      to: {
        enabled: true,
        scaleFactor: 1,
      },
    },
    smooth: {
      enabled: true,
      type: "continuous",
      roundness: 0.5,
    },
  },
  layout: {
    hierarchical: {
      enabled: true,
      direction: "UD",
      sortMethod: "directed",
      levelSeparation: 150,
      nodeSpacing: 100,
    },
  },
  physics: {
    enabled: false,
  },
  interaction: {
    tooltipDelay: 200,
    hideEdgesOnDrag: true,
    selectConnectedEdges: true,
  },
};

const network = new Network(container, data, options);

// Funções do Modal
function showModal(title: string, message: string): void {
  const modal = document.getElementById("custom-modal") as HTMLDivElement;
  const modalTitle = document.getElementById(
    "modal-title"
  ) as HTMLHeadingElement;
  const modalText = document.getElementById(
    "modal-text"
  ) as HTMLParagraphElement;

  modalTitle.textContent = title;
  modalText.textContent = message;
  modal.style.display = "block";

  // Focar no modal para acessibilidade
  modal.focus();
}

function hideModal(): void {
  const modal = document.getElementById("custom-modal") as HTMLDivElement;
  modal.style.display = "none";
}

// Event listeners do modal
document.addEventListener("DOMContentLoaded", function () {
  const modal = document.getElementById("custom-modal") as HTMLDivElement;
  const closeBtn = document.querySelector(".modal-close") as HTMLSpanElement;
  const okBtn = document.getElementById("modal-ok-btn") as HTMLButtonElement;

  // Fechar modal ao clicar no X
  closeBtn.addEventListener("click", hideModal);

  // Fechar modal ao clicar no botão OK
  okBtn.addEventListener("click", hideModal);

  // Fechar modal ao clicar fora dele
  modal.addEventListener("click", function (event) {
    if (event.target === modal) {
      hideModal();
    }
  });

  // Fechar modal com a tecla ESC
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.style.display === "block") {
      hideModal();
    }
  });
});

network.on("click", function (params) {
  if (params.nodes.length > 0) {
    const nodeId = params.nodes[0];
    const node = nodes.get(nodeId) as TreeNode;
    if (node) {
      const parentInput = document.getElementById(
        "parent-input"
      ) as HTMLInputElement;
      parentInput.value = node.id?.toString() || "";
      console.log(`Nó selecionado: ${node.name} (ID: ${node.id})`);
    }
  }
});

function createRootNode(): void {
  if (nodes.length === 0) {
    const rootNode: TreeNode = {
      id: nodeIdCounter++,
      label: "Início",
      category: "root",
      name: "Início",
      level: 0,
      color: {
        background: "#7c3aed",
        border: "#5b21b6",
      },
    };
    nodes.add(rootNode);
    maxLevel = 0;
    console.log("Nó raiz criado!");
  }
}

function addItem(): void {
  const parentInput = document.getElementById(
    "parent-input"
  ) as HTMLInputElement;
  const categoryInput = document.getElementById(
    "category-input"
  ) as HTMLInputElement;
  const nameInput = document.getElementById("name-input") as HTMLInputElement;

  const parentIdentifier = parentInput.value.trim();
  const category = categoryInput.value.trim();
  const name = nameInput.value.trim();

  if (!category || !name) {
    showModal("Erro", "Por favor, preencha a categoria e o nome!");
    return;
  }

  let parentNode: TreeNode | null = null;

  if (parentIdentifier) {
    const allNodes = nodes.get() as TreeNode[];
    parentNode =
      allNodes.find(
        (node) =>
          node.id?.toString() === parentIdentifier ||
          node.name?.toLowerCase() === parentIdentifier.toLowerCase()
      ) || null;

    if (!parentNode) {
      showModal("Erro", "Nó pai não encontrado! Use o ID ou nome exato.");
      return;
    }
  } else {
    const allNodes = nodes.get() as TreeNode[];
    parentNode = allNodes.find((node) => node.category === "root") || null;

    if (!parentNode) {
      createRootNode();
      const allNodesUpdated = nodes.get() as TreeNode[];
      parentNode =
        allNodesUpdated.find((node) => node.category === "root") || null;
    }
  }

  if (!parentNode) {
    showModal("Erro", "Erro ao encontrar nó pai!");
    return;
  }

  const newLevel = (parentNode.level || 0) + 1;
  maxLevel = Math.max(maxLevel, newLevel);

  const newNode: TreeNode = {
    id: nodeIdCounter++,
    label: `${category}\n${name}`,
    category: category,
    name: name,
    level: newLevel,
    parentId: parentNode.id,
    color: {
      background: getColorByLevel(newLevel),
      border: "#1f2937",
    },
  };

  nodes.add(newNode);

  const newEdge: Edge = {
    from: parentNode.id,
    to: newNode.id,
  };
  edges.add(newEdge);

  console.log(
    `Item "${name}" (${category}) adicionado como filho de "${parentNode.name}"`
  );

  parentInput.value = "";
  categoryInput.value = "";
  nameInput.value = "";
}

function getColorByLevel(level: number): string {
  const colors = [
    "#7c3aed", // Nível 0 - Roxo vibrante
    "#059669", // Nível 1 - Verde esmeralda
    "#dc2626", // Nível 2 - Vermelho vibrante
    "#2563eb", // Nível 3 - Azul vibrante
    "#ea580c", // Nível 4 - Laranja vibrante
    "#0891b2", // Nível 5 - Ciano vibrante
  ];
  return colors[level % colors.length];
}

// Função para contar e listar todas as combinações possíveis
function countAndListCombinations(): void {
  const allNodes = nodes.get() as TreeNode[];
  const leafNodes = allNodes.filter((node) => {
    const hasChildren = edges.get().some((edge) => edge.from === node.id);
    return !hasChildren && node.category !== "root";
  });

  if (leafNodes.length === 0) {
    showModal("Aviso", "Não há caminhos completos na árvore!");
    return;
  }

  const allPaths: TreeNode[][] = [];

  leafNodes.forEach((leaf) => {
    const path = getPathToRoot(leaf, allNodes);
    allPaths.push(path);
  });

  // Criar descrição das combinações
  const combinationsText = allPaths
    .map((path, index) => {
      const pathDescription = path
        .reverse()
        .slice(1) // Remove o nó "Início"
        .map((node) => `${node.category}: ${node.name}`)
        .join(" + ");
      return `${index + 1}. ${pathDescription}`;
    })
    .join("\n");

  // Destacar todas as combinações
  highlightAllPaths(allPaths);

  showModal(
    "Todas as Combinações",
    `Total de combinações possíveis: ${allPaths.length}\n\nTodas as combinações:\n${combinationsText}`
  );
}

// Função para análise de complexidade (simples vs complexo)
function analyzeComplexity(): void {
  const allNodes = nodes.get() as TreeNode[];
  const leafNodes = allNodes.filter((node) => {
    const hasChildren = edges.get().some((edge) => edge.from === node.id);
    return !hasChildren && node.category !== "root";
  });

  if (leafNodes.length === 0) {
    showModal("Aviso", "Não há caminhos completos na árvore!");
    return;
  }

  let simplestPath: TreeNode[] = [];
  let complexPath: TreeNode[] = [];
  let shortestLength = Infinity;
  let longestLength = 0;

  leafNodes.forEach((leaf) => {
    const path = getPathToRoot(leaf, allNodes);
    if (path.length < shortestLength) {
      shortestLength = path.length;
      simplestPath = path;
    }
    if (path.length > longestLength) {
      longestLength = path.length;
      complexPath = path;
    }
  });

  // Destacar ambos os caminhos
  highlightComplexityPaths(simplestPath, complexPath);

  const simplestDescription = simplestPath
    .reverse()
    .slice(1) // Remove o nó "Início"
    .map((node) => `${node.category}: ${node.name}`)
    .join(" + ");

  const complexDescription = complexPath
    .reverse()
    .slice(1) // Remove o nó "Início"
    .map((node) => `${node.category}: ${node.name}`)
    .join(" + ");

  showModal(
    "Análise de Complexidade",
    `🟢 LOOK MAIS SIMPLES (${
      shortestLength - 1
    } escolhas):\n${simplestDescription}\n\n` +
      `🔴 LOOK MAIS COMPLEXO (${
        longestLength - 1
      } escolhas):\n${complexDescription}\n\n` +
      `Diferença: ${longestLength - shortestLength} escolhas adicionais`
  );
}

function getPathToRoot(node: TreeNode, allNodes: TreeNode[]): TreeNode[] {
  const path: TreeNode[] = [node];
  let currentNode = node;

  while (currentNode.parentId) {
    const parent = allNodes.find((n) => n.id === currentNode.parentId);
    if (parent) {
      path.push(parent);
      currentNode = parent;
    } else {
      break;
    }
  }

  return path;
}

// Função para destacar todas as combinações
function highlightAllPaths(paths: TreeNode[][]): void {
  resetHighlight();

  const colors = ["#ff6b6b", "#34d399", "#fbbf24", "#a78bfa", "#fb7185"];

  paths.forEach((path, index) => {
    const color = colors[index % colors.length];

    // Destacar nós do caminho
    path.forEach((node) => {
      nodes.update({
        id: node.id,
        color: {
          background: color,
          border: "#1f2937",
        },
      });
    });

    // Destacar arestas do caminho
    highlightEdgesForPath(path, color);
  });
}

// Função para destacar caminhos de complexidade (simples vs complexo)
function highlightComplexityPaths(
  simplestPath: TreeNode[],
  complexPath: TreeNode[]
): void {
  resetHighlight();

  // Destacar caminho mais simples em verde
  simplestPath.forEach((node) => {
    nodes.update({
      id: node.id,
      color: {
        background: "#10b981",
        border: "#065f46",
      },
    });
  });

  // Destacar caminho mais complexo em vermelho
  complexPath.forEach((node) => {
    nodes.update({
      id: node.id,
      color: {
        background: "#ef4444",
        border: "#991b1b",
      },
    });
  });

  // Destacar arestas
  highlightEdgesForPath(simplestPath, "#10b981");
  highlightEdgesForPath(complexPath, "#ef4444");
}

// Função auxiliar para resetar o highlight
function resetHighlight(): void {
  const allNodes = nodes.get() as TreeNode[];
  allNodes.forEach((node) => {
    nodes.update({
      id: node.id,
      color: {
        background: getColorByLevel(node.level || 0),
        border: "#1f2937",
      },
    });
  });

  const allEdges = edges.get();
  allEdges.forEach((edge) => {
    edges.update({
      id: edge.id,
      color: {
        color: "#848484",
        highlight: "#646cff",
      },
    });
  });
}

// Função auxiliar para destacar arestas de um caminho
function highlightEdgesForPath(
  path: TreeNode[],
  color: string = "#ff6b6b"
): void {
  const allEdges = edges.get();

  for (let i = 0; i < path.length - 1; i++) {
    const fromNode = path[i + 1]; // Pai
    const toNode = path[i]; // Filho

    const edge = allEdges.find(
      (e) => e.from === fromNode.id && e.to === toNode.id
    );
    if (edge) {
      edges.update({
        id: edge.id,
        color: {
          color: color,
          highlight: color,
        },
      });
    }
  }
}

function resetGraph(): void {
  nodes.clear();
  edges.clear();
  nodeIdCounter = 1;
  maxLevel = 0;
  console.log("Grafo resetado!");
}

function centerGraph(): void {
  network.fit({
    animation: {
      duration: 800,
      easingFunction: "easeInOutQuad",
    },
  });
  console.log("Gráfico centralizado!");
}

function createDefaultExamples(): void {
  createRootNode();

  setTimeout(() => {
    addExampleNode("1", "Blusa", "Opções de Blusa");
    addExampleNode("1", "Calça", "Opções de Calça");
    addExampleNode("1", "Sapato", "Opções de Sapato");

    setTimeout(() => {
      addExampleNode("2", "Blusa", "Rosa");
      addExampleNode("2", "Blusa", "Amarela");
      addExampleNode("2", "Blusa", "Azul");

      addExampleNode("3", "Calça", "Jeans");
      addExampleNode("3", "Calça", "Social");

      addExampleNode("4", "Sapato", "Tênis");
      addExampleNode("4", "Sapato", "Social");
      addExampleNode("4", "Sapato", "Bota");
    }, 100);
  }, 50);
}

function addExampleNode(
  parentId: string,
  category: string,
  name: string
): void {
  const allNodes = nodes.get() as TreeNode[];
  const parentNode = allNodes.find((node) => node.id?.toString() === parentId);

  if (!parentNode) {
    console.log(`Nó pai ${parentId} não encontrado para ${category}: ${name}`);
    return;
  }

  const newLevel = (parentNode.level || 0) + 1;
  maxLevel = Math.max(maxLevel, newLevel);

  const newNode: TreeNode = {
    id: nodeIdCounter++,
    label: `${category}\n${name}`,
    category: category,
    name: name,
    level: newLevel,
    parentId: parentNode.id,
    color: {
      background: getColorByLevel(newLevel),
      border: "#1f2937",
    },
  };

  nodes.add(newNode);

  const newEdge: Edge = {
    from: parentNode.id,
    to: newNode.id,
  };
  edges.add(newEdge);

  console.log(`Exemplo adicionado: ${category} - ${name} (Nível ${newLevel})`);
}

// Event listeners
(document.getElementById("add-item-btn") as HTMLButtonElement).addEventListener(
  "click",
  addItem
);

(
  document.getElementById("count-combinations-btn") as HTMLButtonElement
).addEventListener("click", countAndListCombinations);

(
  document.getElementById("analyze-complexity-btn") as HTMLButtonElement
).addEventListener("click", analyzeComplexity);

(document.getElementById("reset-btn") as HTMLButtonElement).addEventListener(
  "click",
  resetGraph
);

(document.getElementById("center-btn") as HTMLButtonElement).addEventListener(
  "click",
  centerGraph
);

(
  document.getElementById("load-examples-btn") as HTMLButtonElement
).addEventListener("click", function () {
  resetGraph();
  setTimeout(() => createDefaultExamples(), 100);
});

// Event listener para tecla Espaço
document.addEventListener("keydown", function (event) {
  // Verificar se a tecla pressionada é Espaço e não está em um campo de input/textarea
  if (event.code === "Space") {
    const activeElement = document.activeElement;
    const isInputField =
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.getAttribute("contenteditable") === "true");

    if (!isInputField) {
      event.preventDefault(); // Prevenir scroll da página
      centerGraph();
    }
  }
});

createDefaultExamples();
