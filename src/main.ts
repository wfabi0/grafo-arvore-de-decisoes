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
    alert("Por favor, preencha a categoria e o nome!");
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
      alert("Nó pai não encontrado! Use o ID ou nome exato.");
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
    alert("Erro ao encontrar nó pai!");
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

function findShortestPath(): void {
  const allNodes = nodes.get() as TreeNode[];
  const leafNodes = allNodes.filter((node) => {
    const hasChildren = edges.get().some((edge) => edge.from === node.id);
    return !hasChildren && node.category !== "root";
  });

  if (leafNodes.length === 0) {
    alert("Não há caminhos completos na árvore!");
    return;
  }

  let shortestPath: TreeNode[] = [];
  let shortestLength = Infinity;

  leafNodes.forEach((leaf) => {
    const path = getPathToRoot(leaf, allNodes);
    if (path.length < shortestLength) {
      shortestLength = path.length;
      shortestPath = path;
    }
  });

  highlightPath(shortestPath);

  const pathDescription = shortestPath
    .reverse()
    .map((node) => `${node.category}: ${node.name}`)
    .join(" → ");

  alert(
    `Menor caminho encontrado (${
      shortestLength - 1
    } escolhas):\n${pathDescription}`
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

function highlightPath(path: TreeNode[]): void {
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

  path.forEach((node) => {
    nodes.update({
      id: node.id,
      color: {
        background: "#ff6b6b",
        border: "#dc2626",
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
          color: "#ff6b6b",
          highlight: "#dc2626",
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

(document.getElementById("search-btn") as HTMLButtonElement).addEventListener(
  "click",
  findShortestPath
);

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
