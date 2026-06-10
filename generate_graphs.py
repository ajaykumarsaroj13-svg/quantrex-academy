import matplotlib.pyplot as plt
import numpy as np

def generate_q35():
    fig, axs = plt.subplots(1, 4, figsize=(16, 4))
    x_pos = np.linspace(0, 3, 100)
    x_neg = np.linspace(-3, 0, 100)
    x_all = np.linspace(-3, 3, 100)
    
    # Common settings
    for idx, ax in enumerate(axs):
        ax.axhline(0, color='black', linewidth=1)
        ax.axvline(0, color='black', linewidth=1)
        ax.set_xlim(-4, 4)
        ax.set_ylim(-4, 4)
        ax.set_xticks([])
        ax.set_yticks([])
        ax.set_title(f'({chr(65+idx)})', loc='left')
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['bottom'].set_visible(False)
        ax.spines['left'].set_visible(False)

    # Option A: y = x^2
    axs[0].plot(x_all, x_all**2, color='blue', linewidth=2)
    
    # Option B: y = x^2, y = -x^2 for x >= 0 (Correct answer for sqrt(|y|) = x)
    axs[1].plot(x_pos, x_pos**2, color='blue', linewidth=2)
    axs[1].plot(x_pos, -x_pos**2, color='blue', linewidth=2)
    
    # Option C: y = x^2 for x >= 0
    axs[2].plot(x_pos, x_pos**2, color='blue', linewidth=2)
    
    # Option D: y = x^2, y = -x^2 for all x
    axs[3].plot(x_all, x_all**2, color='blue', linewidth=2)
    axs[3].plot(x_all, -x_all**2, color='blue', linewidth=2)
    
    plt.tight_layout()
    plt.savefig('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/public/images/q35_graph.png', dpi=300, bbox_inches='tight')
    plt.close()

def generate_q86():
    fig, ax = plt.subplots(figsize=(8, 5))
    x = np.linspace(-np.pi/2 + 0.1, np.pi/2 - 0.1, 400)
    
    y1 = np.tan(np.sin(x))
    y2 = np.sin(np.tan(x))
    
    ax.plot(x, y1, color='blue', label='$y = \\tan(\\sin x)$', linewidth=2)
    ax.plot(x, y2, color='red', label='$y = \\sin(\\tan x)$', linewidth=2, linestyle='--')
    
    ax.axhline(0, color='black', linewidth=1)
    ax.axvline(0, color='black', linewidth=1)
    ax.set_xlim(-np.pi/2, np.pi/2)
    ax.set_ylim(-1.5, 1.5)
    
    # Set x ticks to pi multiples
    ax.set_xticks([-np.pi/2, -np.pi/4, 0, np.pi/4, np.pi/2])
    ax.set_xticklabels(['$-\\pi/2$', '$-\\pi/4$', '0', '$\\pi/4$', '$\\pi/2$'])
    
    ax.legend(loc='upper left')
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    
    plt.title("Graphs of $y = \\tan(\\sin x)$ and $y = \\sin(\\tan x)$")
    plt.tight_layout()
    plt.savefig('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/public/images/q86_graph.png', dpi=300, bbox_inches='tight')
    plt.close()

if __name__ == '__main__':
    generate_q35()
    generate_q86()
